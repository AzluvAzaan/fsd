package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/auth"
)

// AuthHandler handles HTTP requests for UC1: Login via Gmail.
type AuthHandler struct {
	authService *auth.Service
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(authService *auth.Service) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// GoogleLogin initiates the Google OAuth flow.
// GET /auth/google/login
func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	// TODO: redirect to Google consent screen
}

// GoogleCallback handles the OAuth callback.
// GET /auth/google/callback?code=...
func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	// TODO: exchange code via authService, set session/cookie, return user
}

// Logout logs the user out.
// POST /auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// TODO: clear session
}
