package event

import "time"

// Event represents a calendar entry — either manually created, synced from
// Google Calendar, or created via the text-parser / Telegram bot.
type Event struct {
	ID         string    `json:"id"`
	CalendarID string    `json:"calendarId"` // FK to calendars table
	Title      string    `json:"title"`
	Type       string    `json:"type"` // e.g. "meeting", "personal"
	StartTime  time.Time `json:"startTime"`
	EndTime    time.Time `json:"endTime"`
	Status     string    `json:"status"`    // confirmed, pending, rejected, cancelled
	Source     string    `json:"source"`    // manual, google, apple, telegram, text, request
	RequestID  string    `json:"requestId"` // set when source=="request"; FK to event_requests.id
	CreatedAt  time.Time `json:"createdAt"`
}

// BusySlot is a simplified view of a time range where a user is busy.
// Used in UC4 (view group calendars) and UC5 (check group availability).
type BusySlot struct {
	UserID    string    `json:"userId"`
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
}

// FreeSlot represents a time range when all selected members are free.
type FreeSlot struct {
	StartTime time.Time `json:"startTime"`
	EndTime   time.Time `json:"endTime"`
}
