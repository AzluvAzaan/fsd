package middleware

import (
	"context"
	"net/http"
)

// contextKey is a private type for context keys in this package.
type contextKey string

const userIDKey contextKey = "userID"

// Auth is a middleware that checks for a valid session/JWT and injects
// the authenticated user ID into the request context.
func Auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// TODO: implement — extract JWT/session, validate, get userID
		// For now, read from header for development:
		userID := r.Header.Get("X-User-ID")
		if userID == "" {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), userIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// UserIDFromContext extracts the authenticated user ID from the request context.
func UserIDFromContext(ctx context.Context) (string, bool) {
	uid, ok := ctx.Value(userIDKey).(string)
	return uid, ok
}
