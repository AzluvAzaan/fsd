package choreographer

import "time"

// Domain event type constants published on the event bus.
// The choreographer subscribes to these and triggers downstream reactions.
const (
	// EventTypeCalendarSynced fires when a Google or Apple calendar sync completes (UC10).
	EventTypeCalendarSynced = "calendar.synced"

	// EventTypeEventRequestAccepted fires when a recipient accepts an event request (UC8).
	EventTypeEventRequestAccepted = "event_request.accepted"

	// EventTypeEventRequestRejected fires when a recipient rejects an event request (UC8).
	EventTypeEventRequestRejected = "event_request.rejected"

	// EventTypeManualEventCreated fires when a user adds a manual calendar entry (UC6).
	EventTypeManualEventCreated = "event.manual_created"
)

// CalendarSyncedPayload carries metadata about a completed external calendar sync.
type CalendarSyncedPayload struct {
	UserID   string // user whose calendar was synced
	Provider string // "google" or "apple"
	Count    int    // number of events upserted
}

// EventRequestResponsePayload carries metadata about an accept or reject decision.
// The full request context is included so the choreographer can create/update
// calendar events without making an additional repository call.
type EventRequestResponsePayload struct {
	RequestID string // the request that was responded to
	UserID    string // the user who responded (recipient)
	Response  string // "accepted" or "rejected"

	// Request context needed for event creation/update.
	SenderID           string
	Title              string
	EventType          string
	ProposedStart      time.Time
	ProposedEnd        time.Time
	PlaceholderEventID string // sender's pending placeholder event; empty if not set
}

// ManualEventCreatedPayload carries metadata when a user creates a manual event.
type ManualEventCreatedPayload struct {
	EventID string
	UserID  string
}
