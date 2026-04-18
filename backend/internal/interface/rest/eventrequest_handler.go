package rest

import (
	"encoding/json"
	"net/http"
	"time"

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
	GroupID       string   `json:"groupId"`
	EventID       string   `json:"eventId,omitempty"`
	Title         string   `json:"title"`
	EventType     string   `json:"eventType"`
	Location      string   `json:"location"`
	Note          string   `json:"note"`
	ProposedStart string   `json:"proposedStart"`
	ProposedEnd   string   `json:"proposedEnd"`
	RecipientIDs  []string `json:"recipientIds"`
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

	proposedStart, err := time.Parse(time.RFC3339, req.ProposedStart)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid proposedStart: expected RFC3339")
		return
	}
	proposedEnd, err := time.Parse(time.RFC3339, req.ProposedEnd)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid proposedEnd: expected RFC3339")
		return
	}

	created, err := h.eventReqService.SendRequest(r.Context(), eventrequest.SendRequestInput{
		SenderID:      userID,
		GroupID:       req.GroupID,
		EventID:       req.EventID,
		Title:         req.Title,
		EventType:     req.EventType,
		Location:      req.Location,
		Note:          req.Note,
		ProposedStart: proposedStart,
		ProposedEnd:   proposedEnd,
		RecipientIDs:  req.RecipientIDs,
	})
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
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

	eventReq, err := h.eventReqService.Respond(r.Context(), eventrequest.RespondInput{
		RequestID:   requestID,
		RecipientID: userID,
		Decision:    req.Decision,
	})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	eventType := choreographer.EventTypeEventRequestRejected
	if req.Decision == "accepted" {
		eventType = choreographer.EventTypeEventRequestAccepted
	}
	h.choreographer.Publish(eventType, choreographer.EventRequestResponsePayload{
		RequestID:          requestID,
		UserID:             userID,
		Response:           req.Decision,
		SenderID:           eventReq.SenderID,
		Title:              eventReq.Title,
		EventType:          eventReq.Type,
		ProposedStart:      eventReq.ProposedStart,
		ProposedEnd:        eventReq.ProposedEnd,
		PlaceholderEventID: eventReq.EventID,
	})

	response.Success(w, map[string]string{"message": "response recorded"})
}

// GetRequest returns a single event request by ID.
// GET /event-requests/{requestId}
func (h *EventRequestHandler) GetRequest(w http.ResponseWriter, r *http.Request) {
	requestID := r.PathValue("requestId")
	if requestID == "" {
		response.Error(w, http.StatusBadRequest, "requestId is required")
		return
	}

	req, err := h.eventReqService.GetRequest(r.Context(), requestID)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.Success(w, req)
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

// DeleteRequest soft-dismisses an event request for the current user only.
// The request row is not removed; other participants are unaffected.
// DELETE /event-requests/{requestId}
func (h *EventRequestHandler) DeleteRequest(w http.ResponseWriter, r *http.Request) {
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

	if err := h.eventReqService.DismissRequest(r.Context(), userID, requestID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.NoContent(w)
}

// ListReceived returns all event requests sent to the authenticated user's groups (all statuses).
// GET /event-requests/received
func (h *EventRequestHandler) ListReceived(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	list, err := h.eventReqService.ListReceived(r.Context(), userID)
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

// ListSent returns event requests created by the authenticated user.
// GET /event-requests/sent
func (h *EventRequestHandler) ListSent(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	list, err := h.eventReqService.ListSent(r.Context(), userID)
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
