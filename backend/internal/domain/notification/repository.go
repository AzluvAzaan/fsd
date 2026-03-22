package notification

import "context"

// Repository defines persistence for notifications.
type Repository interface {
	Create(ctx context.Context, n *Notification) error
	ListByRecipient(ctx context.Context, recipientID string) ([]*Notification, error)
	MarkRead(ctx context.Context, id string) error
}
