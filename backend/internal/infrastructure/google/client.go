package google

import (
	"context"
	"encoding/json"
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
func (c *Client) SendEmail(_ context.Context, recipientEmail, subject, body string) error {
	// TODO: implement with Gmail API
	_, _, _ = recipientEmail, subject, body
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
