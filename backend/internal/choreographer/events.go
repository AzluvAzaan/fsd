package choreographer

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
type EventRequestResponsePayload struct {
	RequestID string // the request that was responded to
	UserID    string // the user who responded
	Response  string // "accepted" or "rejected"
}

// ManualEventCreatedPayload carries metadata when a user creates a manual event.
type ManualEventCreatedPayload struct {
	EventID string
	UserID  string
}
