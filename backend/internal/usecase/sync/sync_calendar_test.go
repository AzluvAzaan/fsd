package sync

import (
	"context"
	"testing"
	"time"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	domainuser "github.com/fsd-group/fsd/internal/domain/user"
)

type MockUserRepo struct {
	UserByID    *domainuser.User
	UserByEmail *domainuser.User

	Err error

	UpsertCalled bool
	DeletedID    string
}

func (m *MockUserRepo) FindByID(ctx context.Context, id string) (*domainuser.User, error) {
	return m.UserByID, m.Err
}

func (m *MockUserRepo) FindByEmail(ctx context.Context, email string) (*domainuser.User, error) {
	return m.UserByEmail, m.Err
}

func (m *MockUserRepo) Upsert(ctx context.Context, u *domainuser.User) error {
	m.UpsertCalled = true
	return m.Err
}

func (m *MockUserRepo) Delete(ctx context.Context, id string) error {
	m.DeletedID = id
	return m.Err
}

type MockCalRepo struct {
	Cal *domaincal.Calendar
	Err error
}

func (m *MockCalRepo) FindOrCreate(ctx context.Context, userID, name, source string) (*domaincal.Calendar, error) {
	return m.Cal, m.Err
}

type MockEventRepo struct {
	CreatedEvent *domainevent.Event
	CreateErr    error
	Upserted     []*domainevent.Event
	Deleted      []string

	List []*domainevent.Event

	Err error
}

func (m *MockEventRepo) Create(ctx context.Context, e *domainevent.Event) error {
	m.CreatedEvent = e
	return m.CreateErr
}

func (m *MockEventRepo) FindByID(ctx context.Context, id string) (*domainevent.Event, error) {
	return nil, nil
}

func (m *MockEventRepo) Update(ctx context.Context, e *domainevent.Event) error {
	return nil
}

func (m *MockEventRepo) Delete(ctx context.Context, id string) error {
	return nil
}

func (m *MockEventRepo) ListByUser(ctx context.Context, userID string, from, to time.Time) ([]*domainevent.Event, error) {
	return nil, nil
}

func (m *MockEventRepo) ListByGroup(ctx context.Context, groupID string, from, to time.Time) ([]*domainevent.Event, error) {
	return nil, nil
}

func (m *MockEventRepo) BusySlots(ctx context.Context, userIDs []string, from, to time.Time) ([]*domainevent.BusySlot, error) {
	return nil, nil
}

func (m *MockEventRepo) Upsert(ctx context.Context, e *domainevent.Event) error {
	return nil
}
func (m *MockEventRepo) DeleteByRequestID(ctx context.Context, requestID string) error {
	return nil
}
func (m *MockEventRepo) UpdateStatusByRequestID(ctx context.Context, requestID string, status string) error {
	return nil
}

type MockProvider struct {
	Events []*domainevent.Event
	Err    error
}

func (m *MockProvider) FetchEvents(ctx context.Context, userID, token string, from, to time.Time) ([]*domainevent.Event, error) {
	return m.Events, m.Err
}
func TestSyncGoogle_Success(t *testing.T) {
	userRepo := &MockUserRepo{
		UserByID: &domainuser.User{GmailToken: "token123"},
	}

	calRepo := &MockCalRepo{
		Cal: &domaincal.Calendar{ID: "cal1"},
	}

	eventRepo := &MockEventRepo{
		List: []*domainevent.Event{},
	}

	provider := &MockProvider{
		Events: []*domainevent.Event{
			{ID: "e1"},
			{ID: "e2"},
		},
	}

	s := NewService(eventRepo, calRepo, provider, nil, userRepo)

	count, err := s.SyncGoogle(context.Background(), "user1", time.Now(), time.Now().Add(time.Hour))
	if err != nil {
		t.Fatal(err)
	}

	if count != 2 {
		t.Errorf("expected 2, got %d", count)
	}

	if len(eventRepo.Upserted) != 2 {
		t.Errorf("expected 2 upserts, got %d", len(eventRepo.Upserted))
	}
}
