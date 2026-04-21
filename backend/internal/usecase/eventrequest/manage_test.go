package eventrequest

import (
	"context"
	"testing"
	"time"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	notification "github.com/fsd-group/fsd/internal/domain/notification"

)

type MockRequestRepo struct {
    // Create
    CreatedRequest *domainevent.EventRequest
    CreateErr      error

    // Find
    FoundRequest *domainevent.EventRequest
    FindErr      error

    // Lists
    PendingRequests []*domainevent.EventRequest
    SentRequests    []*domainevent.EventRequest
    ListPendingErr  error
    ListSentErr     error

    // Respond
    RespondErr error

    // Responses
    Responses    []*domainevent.EventResponse
    ResponsesErr error

    // Status update
    UpdatedStatus string
    UpdateErr     error
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

type MockNotificationRepo struct {
    Created []*notification.Notification
    CreateErr error

    Listed []*notification.Notification
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

    s := NewService(mockReq, mockNotif, nil)

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