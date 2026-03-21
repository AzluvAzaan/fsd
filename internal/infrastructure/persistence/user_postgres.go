package persistence

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fsd-group/fsd/internal/domain/user"
)

// UserPostgresRepo implements user.Repository backed by PostgreSQL.
type UserPostgresRepo struct {
	db *sql.DB
}

func NewUserPostgresRepo(db *sql.DB) *UserPostgresRepo {
	return &UserPostgresRepo{db: db}
}

func (r *UserPostgresRepo) FindByID(ctx context.Context, id string) (*user.User, error) {
	u := &user.User{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, email, display_name, gmail_token, telegram_chat_id, created_at FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.Email, &u.DisplayName, &u.GmailToken, &u.TelegramChatID, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found: %s", id)
	}
	return u, err
}

func (r *UserPostgresRepo) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	u := &user.User{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, email, display_name, gmail_token, telegram_chat_id, created_at FROM users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Email, &u.DisplayName, &u.GmailToken, &u.TelegramChatID, &u.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found with email: %s", email)
	}
	return u, err
}

func (r *UserPostgresRepo) Upsert(ctx context.Context, u *user.User) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO users (id, email, display_name, gmail_token, telegram_chat_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (id) DO UPDATE SET
			email = EXCLUDED.email, display_name = EXCLUDED.display_name,
			gmail_token = EXCLUDED.gmail_token,
			telegram_chat_id = EXCLUDED.telegram_chat_id
	`, u.ID, u.Email, u.DisplayName, u.GmailToken, u.TelegramChatID, u.CreatedAt)
	return err
}

func (r *UserPostgresRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id)
	return err
}
