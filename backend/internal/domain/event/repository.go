package event

import (
	"context"
	"time"
)

// Repository defines the persistence contract for events.
type Repository interface {
	Create(ctx context.Context, e *Event) error
	FindByID(ctx context.Context, id string) (*Event, error)
	Update(ctx context.Context, e *Event) error
	Delete(ctx context.Context, id string) error

	// ListByUser returns all events for a user within a time window.
	// Used by UC3 (personal calendar view).
	ListByUser(ctx context.Context, userID string, from, to time.Time) ([]*Event, error)

	// ListByGroup returns all events associated with a group within a time window.
	ListByGroup(ctx context.Context, groupID string, from, to time.Time) ([]*Event, error)

	// BusySlots returns simplified busy time ranges for a set of users.
	// Used by UC4 and UC5.
	BusySlots(ctx context.Context, userIDs []string, from, to time.Time) ([]*BusySlot, error)

	// Upsert inserts an event or updates it on ID conflict.
	// Used by the sync service to idempotently store external calendar events.
	Upsert(ctx context.Context, e *Event) error
}
