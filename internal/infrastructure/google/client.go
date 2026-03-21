package google

import (
	"context"
	"time"

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
func (c *Client) ExchangeCode(_ context.Context, code string) (*auth.GoogleUserInfo, error) {
	// TODO: implement with golang.org/x/oauth2 + Google People API
	_ = code
	return nil, nil
}

// RefreshToken refreshes an expired access token.
func (c *Client) RefreshToken(_ context.Context, refreshToken string) (string, error) {
	// TODO: implement with golang.org/x/oauth2
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
	// TODO: build URL with clientID, redirectURL, scopes, state
	_ = state
	return ""
}
