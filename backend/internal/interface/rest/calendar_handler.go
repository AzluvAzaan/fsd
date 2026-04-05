package rest

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/fsd-group/fsd/internal/usecase/calendar"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// CalendarHandler handles HTTP requests for UC3, UC4, UC5.
type CalendarHandler struct {
	calendarService *calendar.Service
}

// NewCalendarHandler creates a new calendar handler.
func NewCalendarHandler(calendarService *calendar.Service) *CalendarHandler {
	return &CalendarHandler{calendarService: calendarService}
}

// PersonalView returns the authenticated user's consolidated calendar (UC3).
// GET /calendar?from=2006-01-02T15:04:05Z&to=2006-01-02T15:04:05Z
func (h *CalendarHandler) PersonalView(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	from, to, err := parseDateRange(r)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	view, err := h.calendarService.PersonalView(r.Context(), userID, from, to)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, view)
}

// GroupCalendarView returns overlaid busy/free slots for selected group members (UC4).
// GET /groups/{groupId}/calendar?userIds=uid1,uid2&from=...&to=...
func (h *CalendarHandler) GroupCalendarView(w http.ResponseWriter, r *http.Request) {
	groupID := r.PathValue("groupId")
	if groupID == "" {
		response.Error(w, http.StatusBadRequest, "groupId is required")
		return
	}

	rawUIDs := r.URL.Query().Get("userIds")
	if rawUIDs == "" {
		response.Error(w, http.StatusBadRequest, "userIds query parameter is required")
		return
	}
	userIDs := strings.Split(rawUIDs, ",")

	from, to, err := parseDateRange(r)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	view, err := h.calendarService.GroupCalendarView(r.Context(), groupID, userIDs, from, to)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, view)
}

// CheckAvailability finds free slots for the entire group within a time range (UC5).
// GET /groups/{groupId}/availability?from=...&to=...
func (h *CalendarHandler) CheckAvailability(w http.ResponseWriter, r *http.Request) {
	groupID := r.PathValue("groupId")
	if groupID == "" {
		response.Error(w, http.StatusBadRequest, "groupId is required")
		return
	}

	from, to, err := parseDateRange(r)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	slots, err := h.calendarService.CheckAvailability(r.Context(), groupID, from, to)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, map[string]any{"freeSlots": slots})
}

// parseDateRange extracts and validates the "from" and "to" RFC3339 query parameters.
func parseDateRange(r *http.Request) (time.Time, time.Time, error) {
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	if fromStr == "" || toStr == "" {
		// Default: current week (Monday 00:00 to Sunday 23:59)
		now := time.Now().UTC()
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		from := now.AddDate(0, 0, -(weekday - 1)).Truncate(24 * time.Hour)
		to := from.AddDate(0, 0, 7)
		return from, to, nil
	}

	from, err := time.Parse(time.RFC3339, fromStr)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid 'from' timestamp: %s", fromStr)
	}
	to, err := time.Parse(time.RFC3339, toStr)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid 'to' timestamp: %s", toStr)
	}
	if to.Before(from) {
		return time.Time{}, time.Time{}, fmt.Errorf("'to' must be after 'from'")
	}
	return from, to, nil
}
