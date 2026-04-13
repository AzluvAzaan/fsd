package rest

import (
	"encoding/json"
	"net/http"

	"github.com/fsd-group/fsd/internal/choreographer"
	"github.com/fsd-group/fsd/internal/usecase/eventrequest"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// EventRequestHandler handles HTTP requests for UC7 (send request) and UC8 (respond).
type EventRequestHandler struct {
	eventReqService *eventrequest.Service
	choreographer   *choreographer.Choreographer
}

// NewEventRequestHandler creates a new event request handler.
func NewEventRequestHandler(eventReqService *eventrequest.Service, ch *choreographer.Choreographer) *EventRequestHandler {
	return &EventRequestHandler{eventReqService: eventReqService, choreographer: ch}
}

type sendEventRequestBody struct {
	GroupID      string   `json:"groupId"`
	EventID      string   `json:"eventId"`
	Title        string   `json:"title"`
	EventType    string   `json:"eventType"`
	RecipientIDs []string `json:"recipientIds"`
}

// SendRequest creates a new event request and notifies recipients.
// POST /event-requests
func (h *EventRequestHandler) SendRequest(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req sendEventRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.eventReqService.SendRequest(r.Context(), eventrequest.SendRequestInput{
		SenderID:     userID,
		GroupID:      req.GroupID,
		EventID:      req.EventID,
		Title:        req.Title,
		EventType:    req.EventType,
		RecipientIDs: req.RecipientIDs,
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Created(w, created)
}

type respondEventRequestBody struct {
	Decision string `json:"decision"`
}

// Respond records the authenticated user's accept/reject decision.
// POST /event-requests/{requestId}/respond
func (h *EventRequestHandler) Respond(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	requestID := r.PathValue("requestId")
	if requestID == "" {
		response.Error(w, http.StatusBadRequest, "requestId is required")
		return
	}

	var req respondEventRequestBody
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if err := h.eventReqService.Respond(r.Context(), eventrequest.RespondInput{
		RequestID:   requestID,
		RecipientID: userID,
		Decision:    req.Decision,
	}); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	eventType := choreographer.EventTypeEventRequestRejected
	if req.Decision == "accepted" {
		eventType = choreographer.EventTypeEventRequestAccepted
	}
	h.choreographer.Publish(eventType, choreographer.EventRequestResponsePayload{
		RequestID: requestID,
		UserID:    userID,
		Response:  req.Decision,
	})

	response.Success(w, map[string]string{"message": "response recorded"})
}

// ListPending returns all pending event requests for the authenticated user.
// GET /event-requests/pending
func (h *EventRequestHandler) ListPending(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	list, err := h.eventReqService.ListPending(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if list == nil {
		response.Success(w, []any{})
		return
	}

	response.Success(w, list)
}
