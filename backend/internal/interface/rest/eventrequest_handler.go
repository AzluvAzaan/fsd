package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/eventrequest"
)

// EventRequestHandler handles HTTP requests for UC7 (send request) and UC8 (respond).
type EventRequestHandler struct {
	eventReqService *eventrequest.Service
}

// NewEventRequestHandler creates a new event request handler.
func NewEventRequestHandler(eventReqService *eventrequest.Service) *EventRequestHandler {
	return &EventRequestHandler{eventReqService: eventReqService}
}

// SendRequest creates a new event request and notifies recipients.
// POST /event-requests
func (h *EventRequestHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	// TODO: parse body (eventId, title, eventType, recipientIds), call eventReqService.SendRequest
}

// Respond records the authenticated user's accept/reject decision.
// POST /event-requests/{requestId}/respond
func (h *EventRequestHandler) Respond(w http.ResponseWriter, r *http.Request) {
	// TODO: parse body (decision), extract requestId, call eventReqService.Respond
}

// ListPending returns all pending event requests for the authenticated user.
// GET /event-requests/pending
func (h *EventRequestHandler) ListPending(w http.ResponseWriter, r *http.Request) {
	// TODO: extract userID from context, call eventReqService.ListPending
}
