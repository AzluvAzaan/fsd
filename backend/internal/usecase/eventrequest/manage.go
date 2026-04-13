package eventrequest

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/domain/notification"
)

// NotificationSender abstracts sending notifications (infrastructure boundary for UC9).
type NotificationSender interface {
	// SendEmail sends an email notification via Gmail API.
	// senderToken is the sending user's OAuth access token with gmail.send.
	SendEmail(ctx context.Context, senderToken, recipientEmail, subject, body string) error
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
	GroupID      string
	EventID      string
	Title        string
	EventType    string
	RecipientIDs []string
}

// SendRequest creates a pending event request and notifies recipients (UC7).
func (s *Service) SendRequest(ctx context.Context, in SendRequestInput) (*domainevent.EventRequest, error) {
	if in.SenderID == "" {
		return nil, fmt.Errorf("sender id is required")
	}
	if in.EventID == "" {
		return nil, fmt.Errorf("event id is required")
	}
	if in.Title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if in.GroupID == "" {
		return nil, fmt.Errorf("group id is required")
	}
	if len(in.RecipientIDs) == 0 {
		return nil, fmt.Errorf("recipient ids are required")
	}

	now := time.Now()
	eventReq := &domainevent.EventRequest{
		ID:            uuid.New().String(),
		SenderID:      in.SenderID,
		GroupID:       in.GroupID,
		EventID:       in.EventID,
		Title:         in.Title,
		Type:          in.EventType,
		ProposedStart: time.Time{},
		ProposedEnd:   time.Time{},
		Status:        "pending",
		CreatedAt:     now,
	}

	if err := s.requests.CreateRequest(ctx, eventReq); err != nil {
		return nil, fmt.Errorf("create event request: %w", err)
	}

	reqID := eventReq.ID
	for _, recipientID := range in.RecipientIDs {
		notif := &notification.Notification{
			ID:        uuid.New().String(),
			UserID:    recipientID,
			RequestID: &reqID,
			Type:      "event_request",
			SentAt:    time.Now(),
			Channel:   "in_app",
		}
		if err := s.notifications.Create(ctx, notif); err != nil {
			return nil, fmt.Errorf("create notification for recipient %s: %w", recipientID, err)
		}
	}

	return eventReq, nil
}

// RespondInput carries the recipient's decision.
type RespondInput struct {
	RequestID   string
	RecipientID string
	Decision    string // "accepted" | "rejected"
}

// Respond records a recipient's decision and triggers notifications (UC8 + UC9).
func (s *Service) Respond(ctx context.Context, in RespondInput) error {
	if in.RequestID == "" {
		return fmt.Errorf("request id is required")
	}
	if in.RecipientID == "" {
		return fmt.Errorf("recipient id is required")
	}
	if in.Decision == "" {
		return fmt.Errorf("decision is required")
	}
	if in.Decision != "accepted" && in.Decision != "rejected" {
		return fmt.Errorf("decision must be accepted or rejected")
	}

	resp := &domainevent.EventResponse{
		ID:          uuid.New().String(),
		RequestID:   in.RequestID,
		UserID:      in.RecipientID,
		Response:    in.Decision,
		RespondedAt: time.Now(),
	}
	if err := s.requests.Respond(ctx, resp); err != nil {
		return fmt.Errorf("record event response: %w", err)
	}

	// Update the overall request status to reflect this recipient's decision.
	// "accepted" → confirmed; "rejected" → rejected.
	newStatus := "accepted"
	if in.Decision == "rejected" {
		newStatus = "rejected"
	}
	if err := s.requests.UpdateStatus(ctx, in.RequestID, newStatus); err != nil {
		return fmt.Errorf("update request status: %w", err)
	}

	req, err := s.requests.FindRequestByID(ctx, in.RequestID)
	if err != nil {
		return fmt.Errorf("find event request: %w", err)
	}

	rid := req.ID
	notif := &notification.Notification{
		ID:        uuid.New().String(),
		UserID:    req.SenderID,
		RequestID: &rid,
		Type:      "event_response",
		SentAt:    time.Now(),
		Channel:   "in_app",
	}
	if err := s.notifications.Create(ctx, notif); err != nil {
		return fmt.Errorf("notify sender of response: %w", err)
	}

	return nil
}

// ListPending returns all pending requests for a user (used in UC8 and UC11).
func (s *Service) ListPending(ctx context.Context, recipientID string) ([]*domainevent.EventRequest, error) {
	return s.requests.ListPendingByRecipient(ctx, recipientID)
}
