package notification

import (
	"context"

	domainnotif "github.com/fsd-group/fsd/internal/domain/notification"
)

// Service handles UC9: Notification to User.
type Service struct {
	notifications domainnotif.Repository
}

// NewService creates a new notification service.
func NewService(notifications domainnotif.Repository) *Service {
	return &Service{notifications: notifications}
}

// List returns all notifications for a user.
func (s *Service) List(ctx context.Context, recipientID string) ([]*domainnotif.Notification, error) {
	return s.notifications.ListByRecipient(ctx, recipientID)
}

// MarkRead marks a notification as read.
func (s *Service) MarkRead(ctx context.Context, id string) error {
	return s.notifications.MarkRead(ctx, id)
}
