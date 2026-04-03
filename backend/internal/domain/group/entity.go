package group

import "time"

// Group represents a collection of users who want to find shared availability.
type Group struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	InviteCode  string    `json:"inviteCode"`  // Unique shareable invite code
	CreatedByID string    `json:"createdById"` // The user who created the group
	CreatedAt   time.Time `json:"createdAt"`
}

// GroupMember represents a user's membership in a group.
type GroupMember struct {
	ID       string    `json:"id"`
	GroupID  string    `json:"groupId"`
	UserID   string    `json:"userId"`
	JoinedAt time.Time `json:"joinedAt"`
}
