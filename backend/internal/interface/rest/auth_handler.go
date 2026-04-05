package rest

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
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
	// Generate a secure random state string for CSRF protection
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		http.Error(w, "Failed to generate state", http.StatusInternalServerError)
		return
	}
	state := base64.URLEncoding.EncodeToString(b)

	// Store the state in a cookie so we can validate it in the callback
	http.SetCookie(w, &http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   300, // 5 minutes
	})

	// Get the Google consent URL and redirect the user
	consentURL := h.authService.GoogleConsentURL(state)
	http.Redirect(w, r, consentURL, http.StatusFound)
}

// GoogleCallback handles the OAuth callback.
// GET /auth/google/callback?code=...&state=...
func (h *AuthHandler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Missing code parameter", http.StatusBadRequest)
		return
	}

	// Validate state parameter for CSRF protection
	state := r.URL.Query().Get("state")
	cookie, err := r.Cookie("oauth_state")
	if err != nil || cookie.Value != state {
		http.Error(w, "Invalid state parameter", http.StatusBadRequest)
		return
	}
	// Clear the state cookie
	http.SetCookie(w, &http.Cookie{
		Name:   "oauth_state",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	})

	user, err := h.authService.LoginWithGoogle(ctx, code)
	if err != nil {
		http.Error(w, "Google login failed: "+err.Error(), http.StatusUnauthorized)
		return
	}
	// TODO: Set session/cookie or return JWT as needed
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(user)
}

// Logout logs the user out.
// POST /auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// TODO: clear session
}
