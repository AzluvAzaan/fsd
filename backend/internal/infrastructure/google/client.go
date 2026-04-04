package google

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	"github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/usecase/auth"
)

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

// --- auth.GoogleAuthProvider ---

// ExchangeCode exchanges an OAuth authorization code for tokens and user info.
func (c *Client) ExchangeCode(ctx context.Context, code string) (*auth.GoogleUserInfo, error) {
	conf := &oauth2.Config{
		ClientID:     c.clientID,
		ClientSecret: c.clientSecret,
		RedirectURL:  c.redirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	tok, err := conf.Exchange(ctx, code)
	if err != nil {
		return nil, err
	}

	client := conf.Client(ctx, tok)
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
		Email:       userInfo.Email,
		Name:        userInfo.Name,
		AccessToken: tok.AccessToken,
	}, nil
}

// RefreshToken refreshes an expired access token.
func (c *Client) RefreshToken(_ context.Context, refreshToken string) (string, error) {
	_ = refreshToken
	return "", nil
}

// --- sync.ExternalCalendarProvider ---

// FetchEvents retrieves events from the user's Google Calendar.
func (c *Client) FetchEvents(_ context.Context, userID string, from, to time.Time) ([]*event.Event, error) {
	// TODO: implement with Google Calendar API
	_, _, _ = userID, from, to
	return nil, nil
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
	conf := &oauth2.Config{
		ClientID:     c.clientID,
		ClientSecret: c.clientSecret,
		RedirectURL:  c.redirectURL,
		Scopes:       []string{"openid", "email", "profile"},
		Endpoint:     google.Endpoint,
	}
	return conf.AuthCodeURL(state, oauth2.AccessTypeOffline, oauth2.ApprovalForce)
}
