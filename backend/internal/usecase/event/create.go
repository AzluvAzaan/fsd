package event

import (
	"context"
	"time"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
)

// Service handles UC6: Add a Manual Event.
type Service struct {
	events domainevent.Repository
}

// NewService creates a new event service.
func NewService(events domainevent.Repository) *Service {
	return &Service{events: events}
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
	// TODO: implement — validate, create with Source=manual, Status=confirmed
	return nil, nil
}

// Update modifies an existing event.
func (s *Service) Update(ctx context.Context, e *domainevent.Event) error {
	return s.events.Update(ctx, e)
}

// Delete removes an event.
func (s *Service) Delete(ctx context.Context, id string) error {
	return s.events.Delete(ctx, id)
}
