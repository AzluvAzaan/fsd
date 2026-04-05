// Package calendar implements the Calendar Aggregation Service and Availability Engine.
//
// Calendar Aggregation (UC3): Consolidates all of a user's events — manual entries,
// Google-synced events, Apple-synced events, and accepted group requests — into a
// single ordered view.
//
// Availability Engine (UC4, UC5): Computes busy and free time blocks across a set
// of group members by fetching their confirmed events, merging overlapping intervals,
// and inverting the result to expose free slots within the requested range.
package calendar

import (
	"context"
	"sort"
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
// Includes all manual entries, synced events (Google/Apple), and accepted requests.
func (s *Service) PersonalView(ctx context.Context, userID string, from, to time.Time) (*domaincal.View, error) {
	events, err := s.events.ListByUser(ctx, userID, from, to)
	if err != nil {
		return nil, err
	}
	return &domaincal.View{
		UserID: userID,
		From:   from,
		To:     to,
		Events: events,
	}, nil
}

// GroupCalendarView overlays confirmed busy slots for the selected group members (UC4).
// Returns both the raw busy slots (per user) and merged free slots across all members.
func (s *Service) GroupCalendarView(ctx context.Context, groupID string, selectedUserIDs []string, from, to time.Time) (*domaincal.GroupView, error) {
	busy, err := s.events.BusySlots(ctx, selectedUserIDs, from, to)
	if err != nil {
		return nil, err
	}
	free := computeFreeSlots(busy, from, to)
	return &domaincal.GroupView{
		GroupID:   groupID,
		UserIDs:   selectedUserIDs,
		From:      from,
		To:        to,
		BusySlots: busy,
		FreeSlots: free,
	}, nil
}

// CheckAvailability finds time blocks when every group member is free (UC5).
// It fetches all members, computes the union of their busy intervals,
// then inverts that union to produce free slots within [from, to].
func (s *Service) CheckAvailability(ctx context.Context, groupID string, from, to time.Time) ([]*event.FreeSlot, error) {
	members, err := s.groups.ListMembers(ctx, groupID)
	if err != nil {
		return nil, err
	}

	userIDs := make([]string, len(members))
	for i, m := range members {
		userIDs[i] = m.UserID
	}

	busy, err := s.events.BusySlots(ctx, userIDs, from, to)
	if err != nil {
		return nil, err
	}

	return computeFreeSlots(busy, from, to), nil
}

// computeFreeSlots returns contiguous time ranges within [windowStart, windowEnd]
// that are not covered by any busy slot.
//
// Algorithm:
//  1. Collect all start/end times, sort by start.
//  2. Merge overlapping intervals into a minimal set of busy blocks.
//  3. Gaps between consecutive busy blocks (and at the window edges) are free slots.
func computeFreeSlots(busy []*event.BusySlot, windowStart, windowEnd time.Time) []*event.FreeSlot {
	if len(busy) == 0 {
		return []*event.FreeSlot{{StartTime: windowStart, EndTime: windowEnd}}
	}

	// 1. Sort by start time.
	sort.Slice(busy, func(i, j int) bool {
		return busy[i].StartTime.Before(busy[j].StartTime)
	})

	// 2. Merge overlapping/adjacent busy intervals.
	merged := []event.BusySlot{*busy[0]}
	for _, b := range busy[1:] {
		last := &merged[len(merged)-1]
		if !b.StartTime.After(last.EndTime) {
			// Overlapping or adjacent — extend end if needed.
			if b.EndTime.After(last.EndTime) {
				last.EndTime = b.EndTime
			}
		} else {
			merged = append(merged, *b)
		}
	}

	// 3. Invert merged intervals within the window to get free slots.
	var free []*event.FreeSlot
	cursor := windowStart

	for _, b := range merged {
		start := b.StartTime
		end := b.EndTime

		if start.After(windowEnd) {
			break
		}
		if end.Before(windowStart) {
			continue
		}

		// Gap between cursor and the start of this busy block is free.
		if cursor.Before(start) {
			free = append(free, &event.FreeSlot{StartTime: cursor, EndTime: start})
		}
		if end.After(cursor) {
			cursor = end
		}
	}

	// Trailing free slot after the last busy block.
	if cursor.Before(windowEnd) {
		free = append(free, &event.FreeSlot{StartTime: cursor, EndTime: windowEnd})
	}

	return free
}
