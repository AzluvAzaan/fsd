package notification

import "time"

// Notification represents a message sent to a user (UC9).
type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	RequestID *string   `json:"requestId,omitempty"` // optional: related event request (nullable FK)
	Type      string    `json:"type"`                // e.g. "event_invite", "response_update"
	SentAt    time.Time `json:"sentAt"`
	Channel   string    `json:"channel"` // "email" or "in_app"
}
