package eventrequest

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
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
	notifications notification.Repository
	sender        NotificationSender
	events        domainevent.Repository
	calendars     domaincal.Repository
}

// NewService creates a new event-request service.
func NewService(
	requests domainevent.RequestRepository,
	notifications notification.Repository,
	sender NotificationSender,
	events domainevent.Repository,
	calendars domaincal.Repository,
) *Service {
	return &Service{
		requests:      requests,
		notifications: notifications,
		sender:        sender,
		events:        events,
		calendars:     calendars,
	}
}

// SendRequestInput carries data for creating an event request.
type SendRequestInput struct {
	SenderID      string
	GroupID       string
	EventID       string
	Title         string
	EventType     string
	Location      string
	Note          string
	ProposedStart time.Time
	ProposedEnd   time.Time
	RecipientIDs  []string
}

// SendRequest creates a pending event request, places a placeholder event on the
// sender's personal calendar, and notifies recipients (UC7).
func (s *Service) SendRequest(ctx context.Context, in SendRequestInput) (*domainevent.EventRequest, error) {
	if in.SenderID == "" {
		return nil, fmt.Errorf("sender id is required")
	}
	if in.Title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if in.GroupID == "" {
		return nil, fmt.Errorf("group id is required")
	}
	if in.ProposedStart.IsZero() {
		return nil, fmt.Errorf("proposed start is required")
	}
	if in.ProposedEnd.IsZero() {
		return nil, fmt.Errorf("proposed end is required")
	}
	if !in.ProposedEnd.After(in.ProposedStart) {
		return nil, fmt.Errorf("proposed end must be after proposed start")
	}
	if len(in.RecipientIDs) == 0 {
		return nil, fmt.Errorf("recipient ids are required")
	}

	eventType := in.EventType
	if eventType == "" {
		eventType = "meeting"
	}

	now := time.Now()

	// Reserve a unique ID for the request upfront so we can reference it in placeholder events.
	// request_id in events is plain TEXT (no FK), so placeholders can be created before the
	// request row exists.
	requestID := uuid.New().String()

	// Create a placeholder event on the sender's personal calendar.
	placeholderID := in.EventID
	if placeholderID == "" {
		cal, err := s.calendars.FindOrCreate(ctx, in.SenderID, "Personal", "manual")
		if err != nil {
			return nil, fmt.Errorf("find or create sender calendar: %w", err)
		}
		placeholder := &domainevent.Event{
			ID:         uuid.New().String(),
			CalendarID: cal.ID,
			Title:      in.Title,
			Type:       eventType,
			StartTime:  in.ProposedStart,
			EndTime:    in.ProposedEnd,
			Status:     "pending",
			Source:     "request",
			RequestID:  requestID,
			CreatedAt:  now,
		}
		if err := s.events.Create(ctx, placeholder); err != nil {
			return nil, fmt.Errorf("create placeholder event: %w", err)
		}
		placeholderID = placeholder.ID
	}

	eventReq := &domainevent.EventRequest{
		ID:            requestID,
		SenderID:      in.SenderID,
		GroupID:       in.GroupID,
		EventID:       placeholderID,
		Title:         in.Title,
		Type:          eventType,
		Location:      in.Location,
		Note:          in.Note,
		ProposedStart: in.ProposedStart,
		ProposedEnd:   in.ProposedEnd,
		Status:        "pending",
		CreatedAt:     now,
	}

	if err := s.requests.CreateRequest(ctx, eventReq); err != nil {
		return nil, fmt.Errorf("create event request: %w", err)
	}

	// Create a pending placeholder event on each recipient's calendar.
	for _, recipientID := range in.RecipientIDs {
		recipCal, err := s.calendars.FindOrCreate(ctx, recipientID, "Personal", "manual")
		if err != nil {
			return nil, fmt.Errorf("find or create recipient calendar for %s: %w", recipientID, err)
		}
		recipPlaceholder := &domainevent.Event{
			ID:         uuid.New().String(),
			CalendarID: recipCal.ID,
			Title:      in.Title,
			Type:       eventType,
			StartTime:  in.ProposedStart,
			EndTime:    in.ProposedEnd,
			Status:     "pending",
			Source:     "request",
			RequestID:  requestID,
			CreatedAt:  now,
		}
		if err := s.events.Create(ctx, recipPlaceholder); err != nil {
			return nil, fmt.Errorf("create recipient placeholder event for %s: %w", recipientID, err)
		}
	}

	for _, recipientID := range in.RecipientIDs {
		notif := &notification.Notification{
			ID:        uuid.New().String(),
			UserID:    recipientID,
			RequestID: &requestID,
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

// Respond records a recipient's decision, triggers notifications, and returns the
// updated request so callers can react with full context (UC8 + UC9).
func (s *Service) Respond(ctx context.Context, in RespondInput) (*domainevent.EventRequest, error) {
	if in.RequestID == "" {
		return nil, fmt.Errorf("request id is required")
	}
	if in.RecipientID == "" {
		return nil, fmt.Errorf("recipient id is required")
	}
	if in.Decision == "" {
		return nil, fmt.Errorf("decision is required")
	}
	if in.Decision != "accepted" && in.Decision != "rejected" {
		return nil, fmt.Errorf("decision must be accepted or rejected")
	}

	resp := &domainevent.EventResponse{
		ID:          uuid.New().String(),
		RequestID:   in.RequestID,
		UserID:      in.RecipientID,
		Response:    in.Decision,
		RespondedAt: time.Now(),
	}
	if err := s.requests.Respond(ctx, resp); err != nil {
		return nil, fmt.Errorf("record event response: %w", err)
	}

	// Update the overall request status to reflect this recipient's decision.
	newStatus := "accepted"
	if in.Decision == "rejected" {
		newStatus = "rejected"
	}
	if err := s.requests.UpdateStatus(ctx, in.RequestID, newStatus); err != nil {
		return nil, fmt.Errorf("update request status: %w", err)
	}

	req, err := s.requests.FindRequestByID(ctx, in.RequestID)
	if err != nil {
		return nil, fmt.Errorf("find event request: %w", err)
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
		return nil, fmt.Errorf("notify sender of response: %w", err)
	}

	return req, nil
}

// GetRequest returns a single event request by ID.
func (s *Service) GetRequest(ctx context.Context, id string) (*domainevent.EventRequest, error) {
	return s.requests.FindRequestByID(ctx, id)
}

// ListPending returns all pending requests for a user (used in UC8 and UC11).
func (s *Service) ListPending(ctx context.Context, recipientID string) ([]*domainevent.EventRequest, error) {
	return s.requests.ListPendingByRecipient(ctx, recipientID)
}

// ListSent returns requests created by a user.
func (s *Service) ListSent(ctx context.Context, senderID string) ([]*domainevent.EventRequest, error) {
	return s.requests.ListBySender(ctx, senderID)
}

// ListReceived returns all requests sent to the user's groups (all statuses).
func (s *Service) ListReceived(ctx context.Context, recipientID string) ([]*domainevent.EventRequest, error) {
	return s.requests.ListByRecipient(ctx, recipientID)
}

// DismissRequest hides a request from one user's inbox without affecting anyone else.
func (s *Service) DismissRequest(ctx context.Context, userID, requestID string) error {
	return s.requests.DismissRequest(ctx, userID, requestID)
}

// DeleteRequest removes a request (and its linked responses via FK cascade) as well
// as any placeholder events that were created for it.
// The request row must be deleted FIRST because event_requests.event_id is a FK to
// events.id; deleting events while the request still references them would violate
// the constraint. Once the request row is gone the events can be safely purged.
func (s *Service) DeleteRequest(ctx context.Context, id string) error {
	if err := s.requests.DeleteRequest(ctx, id); err != nil {
		return err
	}
	// Best-effort: clean up placeholder events. If this fails the events become
	// orphaned but are invisible (no linked request) and can be cleaned up later.
	_ = s.events.DeleteByRequestID(ctx, id)
	return nil
}
