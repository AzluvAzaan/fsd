package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/calendar"
)

// CalendarHandler handles HTTP requests for UC3, UC4, UC5.
type CalendarHandler struct {
	calendarService *calendar.Service
}

// NewCalendarHandler creates a new calendar handler.
func NewCalendarHandler(calendarService *calendar.Service) *CalendarHandler {
	return &CalendarHandler{calendarService: calendarService}
}

// PersonalView returns the authenticated user's consolidated calendar.
// GET /calendar?from=...&to=...
func (h *CalendarHandler) PersonalView(w http.ResponseWriter, r *http.Request) {
	// TODO: parse query params (from, to), extract userID from context, call calendarService.PersonalView
}

// GroupCalendarView returns overlaid busy slots for selected group members.
// GET /groups/{groupId}/calendar?userIds=...&from=...&to=...
func (h *CalendarHandler) GroupCalendarView(w http.ResponseWriter, r *http.Request) {
	// TODO: parse groupId, userIds, from, to — call calendarService.GroupCalendarView
}

// CheckAvailability finds free slots for the entire group.
// GET /groups/{groupId}/availability?from=...&to=...
func (h *CalendarHandler) CheckAvailability(w http.ResponseWriter, r *http.Request) {
	// TODO: parse groupId, from, to — call calendarService.CheckAvailability
}
