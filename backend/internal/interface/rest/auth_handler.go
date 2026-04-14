package rest

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"net/url"

	"github.com/fsd-group/fsd/internal/usecase/auth"
)

// AuthHandler handles HTTP requests for UC1: Login via Gmail.
type AuthHandler struct {
	authService *auth.Service
	frontendURL string
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(authService *auth.Service, frontendURL string) *AuthHandler {
	return &AuthHandler{authService: authService, frontendURL: frontendURL}
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

	// Redirect to the frontend callback page with the user info in query params.
	params := url.Values{}
	params.Set("user_id", user.ID)
	params.Set("display_name", user.DisplayName)
	params.Set("email", user.Email)
	redirectURL := h.frontendURL + "/auth/callback?" + params.Encode()
	http.Redirect(w, r, redirectURL, http.StatusFound)
}

// Logout logs the user out.
// POST /auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// TODO: clear session
}
