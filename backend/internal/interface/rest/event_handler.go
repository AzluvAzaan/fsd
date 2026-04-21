package rest

import (
	"net/http"
	"strings"
	"time"

	"github.com/fsd-group/fsd/internal/choreographer"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/usecase/event"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
	"github.com/fsd-group/fsd/pkg/utils"
)

// EventHandler handles HTTP requests for UC6: Add Manual Event.
type EventHandler struct {
	eventService  *event.Service
	choreographer *choreographer.Choreographer
}

// NewEventHandler creates a new event handler.
func NewEventHandler(eventService *event.Service, ch *choreographer.Choreographer) *EventHandler {
	return &EventHandler{eventService: eventService, choreographer: ch}
}

type createManualEventRequest struct {
	Title     string `json:"title"`
	EventType string `json:"eventType"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	GroupID   string `json:"groupId"`
}

// CreateManualEvent adds a manual event to the user's personal calendar.
// POST /events
func (h *EventHandler) CreateManualEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createManualEventRequest
	if err := utils.DecodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	start, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid startTime: expected RFC3339")
		return
	}
	end, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid endTime: expected RFC3339")
		return
	}

	created, err := h.eventService.CreateManual(r.Context(), event.CreateManualInput{
		OwnerID:   userID,
		GroupID:   req.GroupID,
		Title:     req.Title,
		EventType: req.EventType,
		StartTime: start,
		EndTime:   end,
	})
	if err != nil {
		if strings.HasPrefix(err.Error(), "create event:") {
			response.Error(w, http.StatusInternalServerError, err.Error())
			return
		}
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	h.choreographer.Publish(choreographer.EventTypeManualEventCreated, choreographer.ManualEventCreatedPayload{
		EventID: created.ID,
		UserID:  userID,
	})

	response.Created(w, created)
}

type updateEventRequest struct {
	Title     string `json:"title"`
	EventType string `json:"eventType"`
	StartTime string `json:"startTime"`
	EndTime   string `json:"endTime"`
	Status    string `json:"status"`
}

// UpdateEvent updates an existing event.
// PUT /events/{eventId}
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	eventID := r.PathValue("eventId")
	if eventID == "" {
		response.Error(w, http.StatusBadRequest, "eventId is required")
		return
	}

	var req updateEventRequest
	if err := utils.DecodeJSON(r, &req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	start, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid startTime: expected RFC3339")
		return
	}
	end, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		response.Error(w, http.StatusBadRequest, "invalid endTime: expected RFC3339")
		return
	}

	e := &domainevent.Event{
		ID:        eventID,
		Title:     req.Title,
		Type:      req.EventType,
		StartTime: start,
		EndTime:   end,
		Status:    req.Status,
	}

	if err := h.eventService.Update(r.Context(), e); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, e)
}

// DeleteEvent deletes an event.
// DELETE /events/{eventId}
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	eventID := r.PathValue("eventId")
	if eventID == "" {
		response.Error(w, http.StatusBadRequest, "eventId is required")
		return
	}

	if err := h.eventService.Delete(r.Context(), eventID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, map[string]string{"message": "event deleted successfully"})
}
