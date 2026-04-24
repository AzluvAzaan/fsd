package calendar

import (
	"context"
	"testing"
	"time"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	domaingroup "github.com/fsd-group/fsd/internal/domain/group"
)

type MockEventRepo struct {
	CreatedEvent *domainevent.Event
	CreateErr    error
	Upserted     []*domainevent.Event
	Deleted      []string
	Busy         []*domainevent.BusySlot
	List         []*domainevent.Event

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

type MockGroupRepo struct {
	Members []*domaingroup.GroupMember
	Err     error
}

func (m *MockGroupRepo) Create(ctx context.Context, g *domaingroup.Group) error {
	return m.Err
}

func (m *MockGroupRepo) FindByID(ctx context.Context, id string) (*domaingroup.Group, error) {
	return nil, m.Err
}

func (m *MockGroupRepo) FindByInviteCode(ctx context.Context, code string) (*domaingroup.Group, error) {
	return nil, m.Err
}

func (m *MockGroupRepo) ListByUser(ctx context.Context, userID string) ([]*domaingroup.Group, error) {
	return nil, m.Err
}

func (m *MockGroupRepo) Delete(ctx context.Context, id string) error {
	return m.Err
}

func (m *MockGroupRepo) AddMember(ctx context.Context, mbr *domaingroup.GroupMember) error {
	return m.Err
}

func (m *MockGroupRepo) RemoveMember(ctx context.Context, groupID, userID string) error {
	return m.Err
}

func (m *MockGroupRepo) ListMembers(ctx context.Context, groupID string) ([]*domaingroup.GroupMember, error) {
	return m.Members, m.Err
}

func (m *MockGroupRepo) IsMember(ctx context.Context, groupID, userID string) (bool, error) {
	return true, m.Err
}
func TestPersonalView(t *testing.T) {
	eventRepo := &MockEventRepo{}
	groupRepo := &MockGroupRepo{}

	s := NewService(eventRepo, groupRepo)

	from := time.Now()
	to := from.Add(time.Hour)

	res, err := s.PersonalView(context.Background(), "user1", from, to)
	if err != nil {
		t.Fatal(err)
	}

	if res.UserID != "user1" {
		t.Errorf("expected user1, got %s", res.UserID)
	}
}
func TestCheckAvailability(t *testing.T) {
	eventRepo := &MockEventRepo{
		Busy: []*domainevent.BusySlot{
			{
				UserID:    "u1",
				StartTime: time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC),
				EndTime:   time.Date(2026, 1, 1, 11, 0, 0, 0, time.UTC),
			},
			{
				UserID:    "u2",
				StartTime: time.Date(2026, 1, 1, 12, 0, 0, 0, time.UTC),
				EndTime:   time.Date(2026, 1, 1, 13, 0, 0, 0, time.UTC),
			},
		},
	}

	groupRepo := &MockGroupRepo{
		Members: []*domaingroup.GroupMember{
			{UserID: "u1"},
			{UserID: "u2"},
		},
	}

	s := NewService(eventRepo, groupRepo)

	from := time.Date(2026, 1, 1, 9, 0, 0, 0, time.UTC)
	to := time.Date(2026, 1, 1, 14, 0, 0, 0, time.UTC)

	res, err := s.CheckAvailability(context.Background(), "g1", from, to)
	if err != nil {
		t.Fatal(err)
	}

	if len(res) == 0 {
		t.Errorf("expected free slots, got none")
	}
}
func TestComputeFreeSlots(t *testing.T) {
	from := time.Date(2026, 1, 1, 9, 0, 0, 0, time.UTC)
	to := time.Date(2026, 1, 1, 17, 0, 0, 0, time.UTC)

	busy := []*domainevent.BusySlot{
		{
			StartTime: time.Date(2026, 1, 1, 10, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2026, 1, 1, 11, 0, 0, 0, time.UTC),
		},
		{
			StartTime: time.Date(2026, 1, 1, 13, 0, 0, 0, time.UTC),
			EndTime:   time.Date(2026, 1, 1, 14, 0, 0, 0, time.UTC),
		},
	}

	free := computeFreeSlots(busy, from, to)

	if len(free) == 0 {
		t.Fatal("expected free slots")
	}
}
