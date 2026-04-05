package auth

import (
	"context"

	"github.com/google/uuid"

	"github.com/fsd-group/fsd/internal/domain/user"
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
	Email       string
	Name        string
	AccessToken string
}

// Service handles UC1: Login via Gmail.
type Service struct {
	users  user.Repository
	google GoogleAuthProvider
}

// NewService creates a new auth service.
func NewService(users user.Repository, google GoogleAuthProvider) *Service {
	return &Service{users: users, google: google}
}

// LoginWithGoogle handles the Google OAuth callback.
// It exchanges the code, upserts the user, and returns the user entity.
func (s *Service) LoginWithGoogle(ctx context.Context, code string) (*user.User, error) {
	// Exchange the code for user info from Google
	info, err := s.google.ExchangeCode(ctx, code)
	if err != nil {
		return nil, err
	}

	// Check if user already exists
	existing, _ := s.users.FindByEmail(ctx, info.Email)

	// Upsert the user in the database
	u := &user.User{
		Email:       info.Email,
		DisplayName: info.Name,
		GmailToken:  info.AccessToken,
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
	return s.users.FindByEmail(ctx, info.Email)
}

// GoogleConsentURL returns the Google OAuth2 consent screen URL for login.
func (s *Service) GoogleConsentURL(state string) string {
	return s.google.ConsentURL(state)
}
