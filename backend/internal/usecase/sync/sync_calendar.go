// Package sync implements the Sync Service (UC10).
//
// The Sync Service pulls events from external calendar providers (Google Calendar,
// Apple Calendar / iCloud) and upserts them into the local database under the
// user's provider-specific calendar. After a successful sync it publishes a
// CalendarSynced domain event so the choreographer can trigger downstream
// reactions (e.g. refreshing the calendar aggregation view).
package sync

import (
	"context"
	"fmt"
	"time"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/domain/user"
)

// ExternalCalendarProvider abstracts fetching events from an external calendar (UC10).
type ExternalCalendarProvider interface {
	// FetchEvents retrieves the user's events from the external calendar within a time range.
	// refreshToken is the long-lived OAuth refresh token stored on the user record.
	FetchEvents(ctx context.Context, userID, refreshToken string, from, to time.Time) ([]*domainevent.Event, error)
}

// Service handles UC10: Sync External Calendars.
type Service struct {
	events    domainevent.Repository
	calendars domaincal.Repository
	google    ExternalCalendarProvider
	apple     ExternalCalendarProvider // may be nil if Apple sync is not configured
	users     user.Repository          // used to look up the stored OAuth token before syncing
}

// NewService creates a new sync service.
// apple may be nil if the Apple Calendar connector is not available.
func NewService(events domainevent.Repository, calendars domaincal.Repository, google ExternalCalendarProvider, apple ExternalCalendarProvider, users user.Repository) *Service {
	return &Service{events: events, calendars: calendars, google: google, apple: apple, users: users}
}

// SyncGoogle pulls events from Google Calendar and upserts them locally (UC10).
// Returns the number of events synced.
func (s *Service) SyncGoogle(ctx context.Context, userID string, from, to time.Time) (int, error) {
	return s.syncProvider(ctx, userID, from, to, "google", "Google Calendar", s.google)
}

// SyncApple pulls events from Apple Calendar / iCloud and upserts them locally (UC10).
// Returns the number of events synced.
func (s *Service) SyncApple(ctx context.Context, userID string, from, to time.Time) (int, error) {
	if s.apple == nil {
		return 0, fmt.Errorf("apple calendar connector not configured")
	}
	return s.syncProvider(ctx, userID, from, to, "apple", "Apple Calendar", s.apple)
}

// syncProvider is the shared implementation for any external calendar provider.
// It:
//  1. Looks up the user's stored OAuth refresh token.
//  2. Ensures a local calendar record exists for the user + provider.
//  3. Fetches events from the external provider using the refresh token.
//  4. Upserts each event under the local calendar (idempotent).
func (s *Service) syncProvider(
	ctx context.Context,
	userID string,
	from, to time.Time,
	source, calendarName string,
	provider ExternalCalendarProvider,
) (int, error) {
	// 1. Look up the user's stored OAuth refresh token.
	u, err := s.users.FindByID(ctx, userID)
	if err != nil {
		return 0, fmt.Errorf("find user %s: %w", userID, err)
	}
	if u.GmailToken == "" {
		return 0, fmt.Errorf("no Google token stored for user %s — please sign out and sign in again to grant calendar access", userID)
	}

	// 2. Find or create the local calendar for this provider.
	cal, err := s.calendars.FindOrCreate(ctx, userID, calendarName, source)
	if err != nil {
		return 0, fmt.Errorf("get %s calendar for user %s: %w", source, userID, err)
	}

	// 3. Fetch events from the external provider.
	externalEvents, err := provider.FetchEvents(ctx, userID, u.GmailToken, from, to)
	if err != nil {
		return 0, fmt.Errorf("fetch %s events for user %s: %w", source, userID, err)
	}

	// 4. Upsert each event into the local store.
	for _, e := range externalEvents {
		e.CalendarID = cal.ID
		e.Source = source
		if e.Status == "" {
			e.Status = "confirmed"
		}
		if err := s.events.Upsert(ctx, e); err != nil {
			return 0, fmt.Errorf("upsert %s event %s: %w", source, e.ID, err)
		}
	}

	return len(externalEvents), nil
}
