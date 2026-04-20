package session

import "context"

// Repository defines the persistence interface for sessions.
type Repository interface {
	// Create stores a new session.
	Create(ctx context.Context, s *Session) error

	// FindByToken retrieves a session by its token.
	FindByToken(ctx context.Context, token string) (*Session, error)

	// Delete removes a session by token.
	Delete(ctx context.Context, token string) error

	// DeleteByUserID removes all sessions for a user.
	DeleteByUserID(ctx context.Context, userID string) error

	// DeleteExpired removes all expired sessions.
	DeleteExpired(ctx context.Context) error
}
