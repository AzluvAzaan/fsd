package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/event"
)

// EventHandler handles HTTP requests for UC6: Add Manual Event.
type EventHandler struct {
	eventService *event.Service
}

// NewEventHandler creates a new event handler.
func NewEventHandler(eventService *event.Service) *EventHandler {
	return &EventHandler{eventService: eventService}
}

// CreateManualEvent adds a manual event to the user's personal calendar.
// POST /events
func (h *EventHandler) CreateManualEvent(w http.ResponseWriter, r *http.Request) {
	// TODO: parse body (title, eventType, startTime, endTime, groupId), call eventService.CreateManual
}

// UpdateEvent updates an existing event.
// PUT /events/{eventId}
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	// TODO: parse body, call eventService.Update
}

// DeleteEvent deletes an event.
// DELETE /events/{eventId}
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	// TODO: extract eventId, call eventService.Delete
}
