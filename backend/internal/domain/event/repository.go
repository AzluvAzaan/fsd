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

	// UpdateStatusByRequestID sets the status on every event linked to a request.
	// Used when a request is accepted or rejected to promote/cancel all placeholders at once.
	UpdateStatusByRequestID(ctx context.Context, requestID string, status string) error

	// DeleteByRequestID removes all placeholder events linked to a request.
	// Called when the request itself is deleted so no orphan events remain.
	DeleteByRequestID(ctx context.Context, requestID string) error
}
