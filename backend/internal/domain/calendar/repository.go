package calendar

import "context"

// Repository defines the persistence contract for calendars.
type Repository interface {
	// FindOrCreate returns the user's existing calendar for the given source,
	// or creates a new one if none exists. Used by the sync service to ensure
	// a local calendar exists before upserting external events into it.
	FindOrCreate(ctx context.Context, userID, name, source string) (*Calendar, error)
}
