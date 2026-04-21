package auth

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/fsd-group/fsd/internal/domain/session"
	"github.com/fsd-group/fsd/internal/domain/user"
	"github.com/fsd-group/fsd/pkg/security"
)

// GoogleAuthProvider abstracts the Google OAuth2 flow (infrastructure boundary).
type GoogleAuthProvider interface {
	// ConsentURL returns the Google OAuth2 consent screen URL.
	ConsentURL(state string) string

	// ExchangeCode exchanges an OAuth authorization code for tokens and user info.
	ExchangeCode(ctx context.Context, code string) (*GoogleUserInfo, error)

	// RefreshToken refreshes an expired access token.
	RefreshToken(ctx context.Context, refreshToken string) (string, error)
}

// GoogleUserInfo is the data returned from Google after authentication.
type GoogleUserInfo struct {
	Email        string
	Name         string
	AccessToken  string
	RefreshToken string // long-lived token stored for Calendar/Gmail API access
}

// LoginResult contains the user and session token after successful login.
type LoginResult struct {
	User    *user.User
	Session *session.Session
}

// SessionDuration is how long a session token remains valid.
const SessionDuration = 7 * 24 * time.Hour // 7 days

// Service handles UC1: Login via Gmail.
type Service struct {
	users    user.Repository
	sessions session.Repository
	google   GoogleAuthProvider
}

// NewService creates a new auth service.
func NewService(users user.Repository, sessions session.Repository, google GoogleAuthProvider) *Service {
	return &Service{users: users, sessions: sessions, google: google}
}

// LoginWithGoogle handles the Google OAuth callback.
// It exchanges the code, upserts the user, creates a session, and returns the result.
func (s *Service) LoginWithGoogle(ctx context.Context, code string) (*LoginResult, error) {
	// Exchange the code for user info from Google
	info, err := s.google.ExchangeCode(ctx, code)
	if err != nil {
		return nil, err
	}

	// Check if user already exists
	existing, _ := s.users.FindByEmail(ctx, info.Email)

	// Upsert the user in the database.
	// Store the refresh token (long-lived) — used by the sync service to obtain
	// fresh access tokens for Google Calendar and Gmail APIs without requiring
	// the user to re-login.
	gmailToken := info.RefreshToken
	if gmailToken == "" {
		// Fallback: Google only issues a refresh token on first consent or when
		// ApprovalForce is set. If missing, keep whatever token is already stored.
		if existing != nil {
			gmailToken = existing.GmailToken
		} else {
			gmailToken = info.AccessToken
		}
	}
	u := &user.User{
		Email:       info.Email,
		DisplayName: info.Name,
		GmailToken:  gmailToken,
	}
	if existing != nil {
		// Returning user — keep their existing ID
		u.ID = existing.ID
	} else {
		// New user — generate a new ID
		u.ID = uuid.New().String()
	}

	if err := s.users.Upsert(ctx, u); err != nil {
		return nil, err
	}

	// Retrieve the user (with all fields)
	savedUser, err := s.users.FindByEmail(ctx, info.Email)
	if err != nil {
		return nil, err
	}

	// Create a session token
	token, err := security.GenerateToken(32) // 64-char hex string
	if err != nil {
		return nil, err
	}
	sess := &session.Session{
		Token:     token,
		UserID:    savedUser.ID,
		ExpiresAt: time.Now().Add(SessionDuration),
		CreatedAt: time.Now(),
	}
	if err := s.sessions.Create(ctx, sess); err != nil {
		return nil, err
	}

	return &LoginResult{User: savedUser, Session: sess}, nil
}

// GoogleConsentURL returns the Google OAuth2 consent screen URL for login.
func (s *Service) GoogleConsentURL(state string) string {
	return s.google.ConsentURL(state)
}

// Logout deletes the session for the given token.
func (s *Service) Logout(ctx context.Context, token string) error {
	return s.sessions.Delete(ctx, token)
}

// ValidateSession checks if a session token is valid and returns the user ID.
func (s *Service) ValidateSession(ctx context.Context, token string) (string, error) {
	sess, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return "", err
	}
	if sess.IsExpired() {
		_ = s.sessions.Delete(ctx, token)
		return "", err
	}
	return sess.UserID, nil
}
