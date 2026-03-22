package sync

import (
	"context"
	"time"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
)

// ExternalCalendarProvider abstracts fetching events from Google Calendar (UC10).
type ExternalCalendarProvider interface {
	// FetchEvents retrieves events from the user's external calendar within a time range.
	FetchEvents(ctx context.Context, userID string, from, to time.Time) ([]*domainevent.Event, error)
}

// Service handles UC10: Sync External Calendars.
type Service struct {
	events   domainevent.Repository
	provider ExternalCalendarProvider
}

// NewService creates a new sync service.
func NewService(events domainevent.Repository, provider ExternalCalendarProvider) *Service {
	return &Service{events: events, provider: provider}
}

// SyncGoogle pulls events from Google Calendar and upserts them locally (UC10).
func (s *Service) SyncGoogle(ctx context.Context, userID string, from, to time.Time) error {
	// TODO: implement — fetch external events, upsert into local store with Source=google
	return nil
}
