package calendar

import (
	"time"

	"github.com/fsd-group/fsd/internal/domain/event"
)

// Calendar represents a user's calendar (personal or synced).
type Calendar struct {
	ID           string     `json:"id"`
	UserID       string     `json:"userId"`
	Name         string     `json:"name"`
	Source       string     `json:"source"` // "manual", "google", "apple"
	IsDefault    bool       `json:"isDefault"`
	LastSyncedAt *time.Time `json:"lastSyncedAt"`
}

// View represents a consolidated calendar view for a user (UC3).
type View struct {
	UserID string         `json:"userId"`
	From   time.Time      `json:"from"`
	To     time.Time      `json:"to"`
	Events []*event.Event `json:"events"`
}

// GroupView represents a merged calendar view across multiple users (UC4).
type GroupView struct {
	GroupID   string            `json:"groupId"`
	UserIDs   []string          `json:"userIds"`
	From      time.Time         `json:"from"`
	To        time.Time         `json:"to"`
	BusySlots []*event.BusySlot `json:"busySlots"`
	FreeSlots []*event.FreeSlot `json:"freeSlots"`
}
