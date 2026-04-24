package notification

import (
	"context"
	"testing"

	domainnotif "github.com/fsd-group/fsd/internal/domain/notification"
)

type MockNotifRepo struct {
	Listed  []*domainnotif.Notification
	ListErr error

	MarkedReadID string
	MarkErr      error
}

func (m *MockNotifRepo) ListByRecipient(ctx context.Context, recipientID string) ([]*domainnotif.Notification, error) {
	return m.Listed, m.ListErr
}

func (m *MockNotifRepo) MarkRead(ctx context.Context, id string) error {
	m.MarkedReadID = id
	return m.MarkErr
}
func (m *MockNotifRepo) Create(ctx context.Context, n *domainnotif.Notification) error {
	return nil
}
func TestList_Success(t *testing.T) {
	mockRepo := &MockNotifRepo{
		Listed: []*domainnotif.Notification{
			{ID: "n1"},
			{ID: "n2"},
		},
	}

	s := NewService(mockRepo)

	res, err := s.List(context.Background(), "user1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if len(res) != 2 {
		t.Errorf("expected 2 notifications, got %d", len(res))
	}
}
func TestMarkRead_Success(t *testing.T) {
	mockRepo := &MockNotifRepo{}

	s := NewService(mockRepo)

	err := s.MarkRead(context.Background(), "notif123")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if mockRepo.MarkedReadID != "notif123" {
		t.Errorf("expected notif123, got %s", mockRepo.MarkedReadID)
	}
}
