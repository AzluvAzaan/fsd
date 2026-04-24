package event

import (
	"context"
	"fmt"

	"github.com/fsd-group/fsd/internal/domain/event"

	"testing"
	"time"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
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

func TestCreateManual_EmptyTitle(t *testing.T) {
	s := NewService(nil, nil)

	_, err := s.CreateManual(context.Background(), CreateManualInput{
		OwnerID:   "user1",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(time.Hour),
	})

	if err == nil {
		t.Errorf("expected error for empty title")
	}
}

func TestCreateManual_Success(t *testing.T) {
	mockEventRepo := &MockEventRepo{}
	mockCalRepo := &MockCalendarRepo{
		Calendar: &domaincal.Calendar{ID: "cal123"},
	}

	s := NewService(mockEventRepo, mockCalRepo)

	input := CreateManualInput{
		OwnerID:   "user1",
		Title:     "Meeting",
		EventType: "meeting",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(time.Hour),
	}

	e, err := s.CreateManual(context.Background(), input)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if e == nil {
		t.Fatalf("expected event, got nil")
	}

	if e.CalendarID != "cal123" {
		t.Errorf("expected calendarID cal123, got %s", e.CalendarID)
	}

	if mockEventRepo.CreatedEvent == nil {
		t.Errorf("expected event to be created")
	}

	if e.Title != "Meeting" {
		t.Errorf("wrong title")
	}

	if e.Status != "confirmed" {
		t.Errorf("expected confirmed status")
	}
}

func TestCreateManual_CalendarError(t *testing.T) {
	mockCalRepo := &MockCalendarRepo{
		Err: fmt.Errorf("db error"),
	}

	s := NewService(nil, mockCalRepo)

	_, err := s.CreateManual(context.Background(), CreateManualInput{
		OwnerID:   "user1",
		Title:     "Meeting",
		StartTime: time.Now(),
		EndTime:   time.Now().Add(time.Hour),
	})

	if err == nil {
		t.Errorf("expected error")
	}
}

func TestCreateManual_CreateEventFails(t *testing.T) {
	mockEventRepo := &MockEventRepo{
		CreateErr: fmt.Errorf("insert failed"),
	}

	mockCalRepo := &MockCalendarRepo{
		Calendar: &domaincal.Calendar{ID: "cal123"},
	}

	s := NewService(mockEventRepo, mockCalRepo)

	_, err := s.CreateManual(context.Background(), CreateManualInput{
		OwnerID:   "user1",
		Title:     "Meeting",
		StartTime: time.Now(), EndTime: time.Now().Add(time.Hour),
	})

	if err == nil {
		t.Errorf("expected error")
	}
}
