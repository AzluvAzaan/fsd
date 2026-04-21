package persistence

import (
	"context"
	"database/sql"
	"fmt"

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
	var requestID any
	if n.RequestID != nil {
		requestID = *n.RequestID
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO notifications (id, user_id, request_id, type, sent_at, channel) VALUES ($1, $2, $3, $4, $5, $6)`,
		n.ID, n.UserID, requestID, n.Type, n.SentAt, n.Channel,
	)
	if err != nil {
		return fmt.Errorf("create notification: %w", err)
	}
	return nil
}

func (r *NotificationPostgresRepo) ListByRecipient(ctx context.Context, recipientID string) ([]*notification.Notification, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, user_id, request_id, type, sent_at, channel FROM notifications WHERE user_id = $1 ORDER BY sent_at DESC`,
		recipientID,
	)
	if err != nil {
		return nil, fmt.Errorf("list notifications by recipient: %w", err)
	}
	defer rows.Close()

	var out []*notification.Notification
	for rows.Next() {
		n := &notification.Notification{}
		var reqID sql.NullString
		if err := rows.Scan(&n.ID, &n.UserID, &reqID, &n.Type, &n.SentAt, &n.Channel); err != nil {
			return nil, fmt.Errorf("scan notification: %w", err)
		}
		if reqID.Valid {
			s := reqID.String
			n.RequestID = &s
		}
		out = append(out, n)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate notifications: %w", err)
	}
	return out, nil
}

func (r *NotificationPostgresRepo) MarkRead(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM notifications WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("mark notification read: %w", err)
	}
	return nil
}
