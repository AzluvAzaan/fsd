package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/choreographer"
	syncsvc "github.com/fsd-group/fsd/internal/usecase/sync"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// SyncHandler handles HTTP requests for UC10: Sync External Calendars.
type SyncHandler struct {
	syncService   *syncsvc.Service
	choreographer *choreographer.Choreographer
}

// NewSyncHandler creates a new sync handler.
func NewSyncHandler(syncService *syncsvc.Service, ch *choreographer.Choreographer) *SyncHandler {
	return &SyncHandler{syncService: syncService, choreographer: ch}
}

// SyncGoogle triggers a Google Calendar sync for the authenticated user.
// POST /sync/google
// Body (optional JSON): {"from":"2006-01-02T15:04:05Z","to":"2006-01-02T15:04:05Z"}
func (h *SyncHandler) SyncGoogle(w http.ResponseWriter, r *http.Request) {
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

	count, err := h.syncService.SyncGoogle(r.Context(), userID, from, to)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.choreographer.Publish(choreographer.EventTypeCalendarSynced, choreographer.CalendarSyncedPayload{
		UserID:   userID,
		Provider: "google",
		Count:    count,
	})

	response.Success(w, map[string]any{"synced": count, "provider": "google"})
}

// SyncApple triggers an Apple Calendar / iCloud sync for the authenticated user.
// POST /sync/apple
func (h *SyncHandler) SyncApple(w http.ResponseWriter, r *http.Request) {
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

	count, err := h.syncService.SyncApple(r.Context(), userID, from, to)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	h.choreographer.Publish(choreographer.EventTypeCalendarSynced, choreographer.CalendarSyncedPayload{
		UserID:   userID,
		Provider: "apple",
		Count:    count,
	})

	response.Success(w, map[string]any{"synced": count, "provider": "apple"})
}
