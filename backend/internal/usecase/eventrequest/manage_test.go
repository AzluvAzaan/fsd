package eventrequest

import (
	"context"
	"github.com/fsd-group/fsd/internal/domain/event"
	"testing"
	"time"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	notification "github.com/fsd-group/fsd/internal/domain/notification"
)

type MockEventRepo struct {
	CreatedEvent *event.Event
	CreateErr    error
}

func (m *MockEventRepo) Create(ctx context.Context, e *event.Event) error {
	m.CreatedEvent = e
	return m.CreateErr
}

func (m *MockEventRepo) FindByID(ctx context.Context, id string) (*event.Event, error) {
	return nil, nil
}

func (m *MockEventRepo) Update(ctx context.Context, e *event.Event) error {
	return nil
}

func (m *MockEventRepo) Delete(ctx context.Context, id string) error {
	return nil
}

func (m *MockEventRepo) ListByUser(ctx context.Context, userID string, from, to time.Time) ([]*event.Event, error) {
	return nil, nil
}

func (m *MockEventRepo) ListByGroup(ctx context.Context, groupID string, from, to time.Time) ([]*event.Event, error) {
	return nil, nil
}

func (m *MockEventRepo) BusySlots(ctx context.Context, userIDs []string, from, to time.Time) ([]*event.BusySlot, error) {
	return nil, nil
}

func (m *MockEventRepo) Upsert(ctx context.Context, e *event.Event) error {
	return nil
}
func (m *MockEventRepo) DeleteByRequestID(ctx context.Context, requestID string) error {
	return nil
}
func (m *MockEventRepo) UpdateStatusByRequestID(ctx context.Context, requestID string, status string) error {
	return nil
}

type MockCalendarRepo struct {
	Calendar *domaincal.Calendar
	Err      error
}

func (m *MockCalendarRepo) FindOrCreate(ctx context.Context, ownerID, name, source string) (*domaincal.Calendar, error) {
	return m.Calendar, m.Err
}

type MockRequestRepo struct {
	// Create
	CreatedRequest *domainevent.EventRequest
	CreateErr      error

	// Find
	FoundRequest *domainevent.EventRequest
	FindErr      error

	// Lists
	PendingRequests   []*domainevent.EventRequest
	RecipientRequests []*domainevent.EventRequest
	SentRequests      []*domainevent.EventRequest
	ListPendingErr    error
	ListRecipientErr  error
	ListSentErr       error

	// Respond
	RespondErr error

	// Responses
	Responses    []*domainevent.EventResponse
	ResponsesErr error

	// Status update
	UpdatedStatus string
	UpdateErr     error

	// Delete
	DeleteErr error

	// Dismiss
	DismissErr error
}

func (m *MockRequestRepo) CreateRequest(ctx context.Context, r *domainevent.EventRequest) error {
	m.CreatedRequest = r
	return m.CreateErr
}

func (m *MockRequestRepo) FindRequestByID(ctx context.Context, id string) (*domainevent.EventRequest, error) {
	return m.FoundRequest, m.FindErr
}

func (m *MockRequestRepo) ListPendingByRecipient(ctx context.Context, recipientID string) ([]*domainevent.EventRequest, error) {
	return m.PendingRequests, m.ListPendingErr
}

func (m *MockRequestRepo) ListByRecipient(ctx context.Context, recipientID string) ([]*domainevent.EventRequest, error) {
	return m.RecipientRequests, m.ListRecipientErr
}

func (m *MockRequestRepo) ListBySender(ctx context.Context, senderID string) ([]*domainevent.EventRequest, error) {
	return m.SentRequests, m.ListSentErr
}

func (m *MockRequestRepo) Respond(ctx context.Context, resp *domainevent.EventResponse) error {
	return m.RespondErr
}

func (m *MockRequestRepo) ListResponses(ctx context.Context, requestID string) ([]*domainevent.EventResponse, error) {
	return m.Responses, m.ResponsesErr
}

func (m *MockRequestRepo) UpdateStatus(ctx context.Context, requestID string, status string) error {
	m.UpdatedStatus = status
	return m.UpdateErr
}

func (m *MockRequestRepo) DeleteRequest(ctx context.Context, id string) error {
	return m.DeleteErr
}

func (m *MockRequestRepo) DismissRequest(ctx context.Context, userID, requestID string) error {
	return m.DismissErr
}

// Compile-time check (VERY important)
var _ domainevent.RequestRepository = (*MockRequestRepo)(nil)

type MockNotificationRepo struct {
	Created   []*notification.Notification
	CreateErr error

	Listed  []*notification.Notification
	ListErr error

	MarkReadErr error
}

func (m *MockNotificationRepo) Create(ctx context.Context, n *notification.Notification) error {
	m.Created = append(m.Created, n)
	return m.CreateErr
}

func (m *MockNotificationRepo) ListByRecipient(ctx context.Context, recipientID string) ([]*notification.Notification, error) {
	return m.Listed, m.ListErr
}

func (m *MockNotificationRepo) MarkRead(ctx context.Context, id string) error {
	return m.MarkReadErr
}

func TestSendRequest_CreatesNotifications(t *testing.T) {
	mockReq := &MockRequestRepo{}
	mockNotif := &MockNotificationRepo{}

	s := NewService(mockReq, mockNotif, nil, &MockEventRepo{}, &MockCalendarRepo{})

	now := time.Now()

	input := SendRequestInput{
		SenderID:      "user1",
		GroupID:       "group1",
		Title:         "Meeting",
		ProposedStart: now,
		ProposedEnd:   now.Add(time.Hour),
		RecipientIDs:  []string{"u1", "u2"},
	}

	_, err := s.SendRequest(context.Background(), input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(mockNotif.Created) != 2 {
		t.Errorf("expected 2 notifications, got %d", len(mockNotif.Created))
	}
}
