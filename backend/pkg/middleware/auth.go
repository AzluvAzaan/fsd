package middleware

import (
	"context"
	"net/http"

	"github.com/fsd-group/fsd/internal/domain/session"
)

// contextKey is a private type for context keys in this package.
type contextKey string

const userIDKey contextKey = "userID"

// SessionCookieName must match the cookie name used in auth_handler.go.
const SessionCookieName = "session_token"

// sessionValidator is the interface needed to validate sessions.
type sessionValidator interface {
	FindByToken(ctx context.Context, token string) (*session.Session, error)
}

// sessionRepo is set by SetSessionRepo during bootstrap.
var sessionRepo sessionValidator

// SetSessionRepo injects the session repository for the middleware to use.
func SetSessionRepo(repo sessionValidator) {
	sessionRepo = repo
}

// Auth is a middleware that checks for a valid session cookie and injects
// the authenticated user ID into the request context.
func Auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Try session cookie first
		if cookie, err := r.Cookie(SessionCookieName); err == nil && cookie.Value != "" {
			if sessionRepo != nil {
				sess, err := sessionRepo.FindByToken(r.Context(), cookie.Value)
				if err == nil && !sess.IsExpired() {
					ctx := context.WithValue(r.Context(), userIDKey, sess.UserID)
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}
		}

		// Fallback: X-User-ID header for development
		userID := r.Header.Get("X-User-ID")
		if userID != "" {
			ctx := context.WithValue(r.Context(), userIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		http.Error(w, "unauthorized", http.StatusUnauthorized)
	}
}

// UserIDFromContext extracts the authenticated user ID from the request context.
func UserIDFromContext(ctx context.Context) (string, bool) {
	uid, ok := ctx.Value(userIDKey).(string)
	return uid, ok
}
