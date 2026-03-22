package auth

import (
	"context"

	"github.com/fsd-group/fsd/internal/domain/user"
)

// GoogleAuthProvider abstracts the Google OAuth2 flow (infrastructure boundary).
type GoogleAuthProvider interface {
	// ExchangeCode exchanges an OAuth authorization code for tokens and user info.
	ExchangeCode(ctx context.Context, code string) (*GoogleUserInfo, error)

	// RefreshToken refreshes an expired access token.
	RefreshToken(ctx context.Context, refreshToken string) (string, error)
}

// GoogleUserInfo is the data returned from Google after authentication.
type GoogleUserInfo struct {
	Email string
	Name  string
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
	// TODO: implement — exchange code, upsert user, generate session/JWT
	return nil, nil
}
