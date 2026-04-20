package persistence

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fsd-group/fsd/internal/domain/session"
)

// SessionPostgresRepo implements session.Repository backed by PostgreSQL.
type SessionPostgresRepo struct {
	db *sql.DB
}

func NewSessionPostgresRepo(db *sql.DB) *SessionPostgresRepo {
	return &SessionPostgresRepo{db: db}
}

func (r *SessionPostgresRepo) Create(ctx context.Context, s *session.Session) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO sessions (token, user_id, expires_at, created_at)
		VALUES ($1, $2, $3, $4)
	`, s.Token, s.UserID, s.ExpiresAt, s.CreatedAt)
	return err
}

func (r *SessionPostgresRepo) FindByToken(ctx context.Context, token string) (*session.Session, error) {
	s := &session.Session{}
	err := r.db.QueryRowContext(ctx,
		`SELECT token, user_id, expires_at, created_at FROM sessions WHERE token = $1`,
		token,
	).Scan(&s.Token, &s.UserID, &s.ExpiresAt, &s.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("session not found")
	}
	return s, err
}

func (r *SessionPostgresRepo) Delete(ctx context.Context, token string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sessions WHERE token = $1`, token)
	return err
}

func (r *SessionPostgresRepo) DeleteByUserID(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sessions WHERE user_id = $1`, userID)
	return err
}

func (r *SessionPostgresRepo) DeleteExpired(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sessions WHERE expires_at < NOW()`)
	return err
}
