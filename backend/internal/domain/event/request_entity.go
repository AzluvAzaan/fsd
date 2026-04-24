package event

import "time"

// EventRequest represents an invitation sent from one user to a group (UC7/UC8).
type EventRequest struct {
	ID            string    `json:"id"`
	SenderID      string    `json:"senderId"` // User who sent the request
	GroupID       string    `json:"groupId"`  // Target group
	EventID       string    `json:"eventId"`  // The event this request is for
	Title         string    `json:"title"`
	Type          string    `json:"type"` // e.g. "meeting", "personal"
	Location      string    `json:"location"`
	Note          string    `json:"note"`
	ProposedStart time.Time `json:"proposedStart"`
	ProposedEnd   time.Time `json:"proposedEnd"`
	Status        string    `json:"status"` // pending, accepted, rejected
	CreatedAt     time.Time `json:"createdAt"`
}

// EventResponse records a single user's accept/reject decision on a request.
type EventResponse struct {
	ID          string    `json:"id"`
	RequestID   string    `json:"requestId"`
	UserID      string    `json:"userId"`
	Response    string    `json:"response"` // accepted, rejected, pending
	RespondedAt time.Time `json:"respondedAt"`
}
