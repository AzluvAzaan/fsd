package google

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/usecase/auth"
)

// googleScopes are the OAuth2 scopes requested for all users.
// calendar.readonly is required for FetchEvents (UC10).
var googleScopes = []string{
	"openid",
	"email",
	"profile",
	"https://www.googleapis.com/auth/calendar.readonly",
}

// Client implements both auth.GoogleAuthProvider and sync.ExternalCalendarProvider.
// It wraps the Google OAuth2 + Calendar + Gmail APIs.
type Client struct {
	clientID     string
	clientSecret string
	redirectURL  string
}

// NewClient creates a new Google API client.
func NewClient(clientID, clientSecret, redirectURL string) *Client {
	return &Client{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURL:  redirectURL,
	}
}

func (c *Client) oauthConfig() *oauth2.Config {
	return &oauth2.Config{
		ClientID:     c.clientID,
		ClientSecret: c.clientSecret,
		RedirectURL:  c.redirectURL,
		Scopes:       googleScopes,
		Endpoint:     google.Endpoint,
	}
}

// --- auth.GoogleAuthProvider ---

// ExchangeCode exchanges an OAuth authorization code for tokens and user info.
func (c *Client) ExchangeCode(ctx context.Context, code string) (*auth.GoogleUserInfo, error) {
	tok, err := c.oauthConfig().Exchange(ctx, code)
	if err != nil {
		return nil, err
	}

	client := c.oauthConfig().Client(ctx, tok)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = resp.Body.Close()
	}()

	var userInfo struct {
		Email string `json:"email"`
		Name  string `json:"name"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &auth.GoogleUserInfo{
		Email:        userInfo.Email,
		Name:         userInfo.Name,
		AccessToken:  tok.AccessToken,
		RefreshToken: tok.RefreshToken,
	}, nil
}

// RefreshToken exchanges a refresh token for a new access token.
func (c *Client) RefreshToken(ctx context.Context, refreshToken string) (string, error) {
	tok := &oauth2.Token{RefreshToken: refreshToken}
	ts := c.oauthConfig().TokenSource(ctx, tok)
	newTok, err := ts.Token()
	if err != nil {
		return "", fmt.Errorf("refresh google token: %w", err)
	}
	return newTok.AccessToken, nil
}

// --- sync.ExternalCalendarProvider ---

// calendarEventItem is the relevant subset of a Google Calendar API event.
type calendarEventItem struct {
	ID      string `json:"id"`
	Summary string `json:"summary"`
	Status  string `json:"status"`
	Start   struct {
		DateTime string `json:"dateTime"`
		Date     string `json:"date"` // all-day events
	} `json:"start"`
	End struct {
		DateTime string `json:"dateTime"`
		Date     string `json:"date"`
	} `json:"end"`
}

// FetchEvents retrieves events from the user's Google Calendar using the stored refresh token.
// refreshToken is the long-lived Google OAuth refresh token stored on the user record.
func (c *Client) FetchEvents(ctx context.Context, userID, refreshToken string, from, to time.Time) ([]*event.Event, error) {
	if refreshToken == "" {
		return nil, fmt.Errorf("no Google refresh token for user %s — please re-login to grant calendar access", userID)
	}

	// Use the refresh token to get a valid access token.
	tok := &oauth2.Token{RefreshToken: refreshToken}
	ts := c.oauthConfig().TokenSource(ctx, tok)
	httpClient := oauth2.NewClient(ctx, ts)

	// Build the Calendar API request.
	params := url.Values{}
	params.Set("timeMin", from.UTC().Format(time.RFC3339))
	params.Set("timeMax", to.UTC().Format(time.RFC3339))
	params.Set("singleEvents", "true")
	params.Set("orderBy", "startTime")

	apiURL := "https://www.googleapis.com/calendar/v3/calendars/primary/events?" + params.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	if err != nil {
		return nil, fmt.Errorf("build calendar request: %w", err)
	}

	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("call google calendar api: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read calendar response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google calendar api: status %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Items []calendarEventItem `json:"items"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, fmt.Errorf("parse calendar response: %w", err)
	}

	events := make([]*event.Event, 0, len(result.Items))
	for _, item := range result.Items {
		if item.Status == "cancelled" {
			continue
		}

		startTime, err := parseGoogleTime(item.Start.DateTime, item.Start.Date)
		if err != nil {
			continue // skip malformed events
		}
		endTime, err := parseGoogleTime(item.End.DateTime, item.End.Date)
		if err != nil {
			continue
		}

		title := item.Summary
		if title == "" {
			title = "(No title)"
		}

		events = append(events, &event.Event{
			ID:        item.ID,
			Title:     title,
			Type:      "google",
			StartTime: startTime,
			EndTime:   endTime,
			Status:    "confirmed",
			Source:    "google",
		})
	}

	return events, nil
}

// parseGoogleTime parses a Google Calendar dateTime or date string into a time.Time.
func parseGoogleTime(dateTime, date string) (time.Time, error) {
	if dateTime != "" {
		return time.Parse(time.RFC3339, dateTime)
	}
	if date != "" {
		return time.Parse("2006-01-02", date)
	}
	return time.Time{}, fmt.Errorf("no time value")
}

// --- eventrequest.NotificationSender (Gmail) ---

// SendEmail sends an email notification via Gmail API.
// senderToken is the OAuth2 access token for the sending user (gmail.send scope).
func (c *Client) SendEmail(ctx context.Context, senderToken, recipientEmail, subject, body string) error {
	if strings.TrimSpace(senderToken) == "" {
		return fmt.Errorf("gmail access token is required")
	}
	if strings.TrimSpace(recipientEmail) == "" {
		return fmt.Errorf("recipient email is required")
	}

	rfc2822 := fmt.Sprintf(
		"To: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=\"UTF-8\"\r\nMIME-Version: 1.0\r\n\r\n%s",
		recipientEmail, subject, body,
	)
	raw := base64.RawURLEncoding.EncodeToString([]byte(rfc2822))

	reqBody, err := json.Marshal(map[string]string{"raw": raw})
	if err != nil {
		return fmt.Errorf("marshal gmail send request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
		bytes.NewReader(reqBody))
	if err != nil {
		return fmt.Errorf("create gmail send http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+senderToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("gmail send http request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("read gmail send response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("gmail send: status %d: %s", resp.StatusCode, string(respBytes))
	}
	return nil
}

// ConsentURL returns the Google OAuth2 consent screen URL.
func (c *Client) ConsentURL(state string) string {
	return c.oauthConfig().AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
}
