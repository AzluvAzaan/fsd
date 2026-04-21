package event

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
)

// Service handles UC6: Add a Manual Event.
type Service struct {
	events    domainevent.Repository
	calendars domaincal.Repository
}

// NewService creates a new event service.
func NewService(events domainevent.Repository, calendars domaincal.Repository) *Service {
	return &Service{events: events, calendars: calendars}
}

// CreateManualInput carries data for adding a manual event.
type CreateManualInput struct {
	OwnerID   string
	GroupID   string // optional
	Title     string
	EventType string
	StartTime time.Time
	EndTime   time.Time
}

// CreateManual adds a manual event to the user's personal calendar (UC6).
func (s *Service) CreateManual(ctx context.Context, in CreateManualInput) (*domainevent.Event, error) {
	if in.Title == "" {
		return nil, fmt.Errorf("title is required")
	}
	if in.StartTime.IsZero() {
		return nil, fmt.Errorf("start time is required")
	}
	if in.EndTime.IsZero() {
		return nil, fmt.Errorf("end time is required")
	}
	if !in.EndTime.After(in.StartTime) {
		return nil, fmt.Errorf("end time must be after start time")
	}
	if in.OwnerID == "" {
		return nil, fmt.Errorf("owner id is required")
	}

	cal, err := s.calendars.FindOrCreate(ctx, in.OwnerID, "Personal", "manual")
	if err != nil {
		return nil, fmt.Errorf("find or create manual calendar: %w", err)
	}

	now := time.Now()
	e := &domainevent.Event{
		ID:         uuid.New().String(),
		CalendarID: cal.ID,
		Title:      in.Title,
		Type:       in.EventType,
		StartTime:  in.StartTime,
		EndTime:    in.EndTime,
		Status:     "confirmed",
		Source:     "manual",
		CreatedAt:  now,
	}

	if err = s.events.Create(ctx, e); err != nil {
		return nil, fmt.Errorf("create event: %w", err)
	}

	return e, nil
}

// Update modifies an existing event.
func (s *Service) Update(ctx context.Context, e *domainevent.Event) error {
	return s.events.Update(ctx, e)
}

// Delete removes an event.
func (s *Service) Delete(ctx context.Context, id string) error {
	return s.events.Delete(ctx, id)
}
