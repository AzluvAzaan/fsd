package rest

import (
	"crypto/rand"
	"encoding/base64"
	"log"
	"net/http"
	"net/url"
	"time"

	"github.com/fsd-group/fsd/internal/domain/user"
	"github.com/fsd-group/fsd/internal/usecase/auth"
	synccal "github.com/fsd-group/fsd/internal/usecase/sync"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// SessionCookieName is the name of the session cookie.
const SessionCookieName = "session_token"

// AuthHandler handles HTTP requests for UC1: Login via Gmail.
type AuthHandler struct {
	authService *auth.Service
	syncService *synccal.Service
	userRepo    user.Repository
	frontendURL string
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(authService *auth.Service, syncService *synccal.Service, userRepo user.Repository, frontendURL string) *AuthHandler {
	return &AuthHandler{authService: authService, syncService: syncService, userRepo: userRepo, frontendURL: frontendURL}
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

	result, err := h.authService.LoginWithGoogle(ctx, code)
	if err != nil {
		http.Error(w, "Google login failed: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// Set the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    result.Session.Token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // false for localhost development
		SameSite: http.SameSiteLaxMode,
		Expires:  result.Session.ExpiresAt,
	})

	// Sync Google Calendar in background (don't block the redirect)
	go func() {
		// Sync events from 30 days ago to 90 days in the future
		from := time.Now().AddDate(0, 0, -30)
		to := time.Now().AddDate(0, 0, 90)
		if _, err := h.syncService.SyncGoogle(ctx, result.User.ID, from, to); err != nil {
			log.Printf("[AUTH] failed to sync calendar for user %s: %v", result.User.ID, err)
		}
	}()

	// Redirect to the frontend callback page with user info in query params
	// (frontend stores user in localStorage for UI, cookie handles API auth)
	params := url.Values{}
	params.Set("user_id", result.User.ID)
	params.Set("display_name", result.User.DisplayName)
	params.Set("email", result.User.Email)
	redirectURL := h.frontendURL + "/auth/callback?" + params.Encode()
	http.Redirect(w, r, redirectURL, http.StatusFound)
}

// Logout logs the user out by clearing the session.
// POST /auth/logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Get the session token from cookie
	cookie, err := r.Cookie(SessionCookieName)
	if err == nil && cookie.Value != "" {
		_ = h.authService.Logout(ctx, cookie.Value)
	}

	// Clear the session cookie
	http.SetCookie(w, &http.Cookie{
		Name:     SessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
		Expires:  time.Unix(0, 0),
	})

	w.WriteHeader(http.StatusNoContent)
}

// Me returns the current authenticated user.
// GET /auth/me
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "not authenticated")
		return
	}

	u, err := h.userRepo.FindByID(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusNotFound, "user not found")
		return
	}

	response.Success(w, u)
}
