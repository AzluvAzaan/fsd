package eventrequest

import (
	"context"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/domain/notification"
)

// NotificationSender abstracts sending notifications (infrastructure boundary for UC9).
type NotificationSender interface {
	// SendEmail sends an email notification via Gmail API.
	SendEmail(ctx context.Context, recipientEmail, subject, body string) error
}

// Service handles UC7 (send event request) and UC8 (respond to event request).
type Service struct {
	requests      domainevent.RequestRepository
	events        domainevent.Repository
	notifications notification.Repository
	sender        NotificationSender
}

// NewService creates a new event-request service.
func NewService(
	requests domainevent.RequestRepository,
	events domainevent.Repository,
	notifications notification.Repository,
	sender NotificationSender,
) *Service {
	return &Service{
		requests:      requests,
		events:        events,
		notifications: notifications,
		sender:        sender,
	}
}

// SendRequestInput carries data for creating an event request.
type SendRequestInput struct {
	SenderID     string
	EventID      string
	Title        string
	EventType    string
	RecipientIDs []string
}

// SendRequest creates a pending event request and notifies recipients (UC7).
func (s *Service) SendRequest(ctx context.Context, in SendRequestInput) (*domainevent.EventRequest, error) {
	// TODO: implement — create request, mark event as Pending, notify recipients
	return nil, nil
}

// RespondInput carries the recipient's decision.
type RespondInput struct {
	RequestID   string
	RecipientID string
	Decision    string // "accepted" | "rejected"
}

// Respond records a recipient's decision and triggers notifications (UC8 + UC9).
func (s *Service) Respond(ctx context.Context, in RespondInput) error {
	// TODO: implement — record response, update event status, send notification
	return nil
}

// ListPending returns all pending requests for a user (used in UC8 and UC11).
func (s *Service) ListPending(ctx context.Context, recipientID string) ([]*domainevent.EventRequest, error) {
	return s.requests.ListPendingByRecipient(ctx, recipientID)
}
