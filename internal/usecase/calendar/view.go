package calendar

import (
	"context"
	"time"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
	"github.com/fsd-group/fsd/internal/domain/event"
	domaingroup "github.com/fsd-group/fsd/internal/domain/group"
)

// Service handles UC3 (personal calendar), UC4 (group calendar), UC5 (availability).
type Service struct {
	events event.Repository
	groups domaingroup.Repository
}

// NewService creates a new calendar service.
func NewService(events event.Repository, groups domaingroup.Repository) *Service {
	return &Service{events: events, groups: groups}
}

// PersonalView returns a consolidated calendar view for a user (UC3).
// Includes manual entries, synced events, and accepted group requests.
func (s *Service) PersonalView(ctx context.Context, userID string, from, to time.Time) (*domaincal.View, error) {
	// TODO: implement — aggregate events from all sources
	return nil, nil
}

// GroupCalendarView overlays busy slots for selected group members (UC4).
func (s *Service) GroupCalendarView(ctx context.Context, groupID string, selectedUserIDs []string, from, to time.Time) (*domaincal.GroupView, error) {
	// TODO: implement — fetch busy slots, merge, return
	return nil, nil
}

// CheckAvailability finds free slots for the entire group within a time range (UC5).
func (s *Service) CheckAvailability(ctx context.Context, groupID string, from, to time.Time) ([]*event.FreeSlot, error) {
	// TODO: implement — get all members, compute busy union, invert to free slots
	return nil, nil
}
