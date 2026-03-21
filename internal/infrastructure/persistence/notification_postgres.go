package persistence

import (
	"context"
	"database/sql"

	"github.com/fsd-group/fsd/internal/domain/notification"
)

// NotificationPostgresRepo implements notification.Repository backed by PostgreSQL.
type NotificationPostgresRepo struct {
	db *sql.DB
}

func NewNotificationPostgresRepo(db *sql.DB) *NotificationPostgresRepo {
	return &NotificationPostgresRepo{db: db}
}

func (r *NotificationPostgresRepo) Create(ctx context.Context, n *notification.Notification) error {
	// TODO: implement
	panic("not implemented")
}

func (r *NotificationPostgresRepo) ListByRecipient(ctx context.Context, recipientID string) ([]*notification.Notification, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *NotificationPostgresRepo) MarkRead(ctx context.Context, id string) error {
	// TODO: implement
	panic("not implemented")
}
