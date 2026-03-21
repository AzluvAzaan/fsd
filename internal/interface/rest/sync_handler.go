package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/sync"
)

// SyncHandler handles HTTP requests for UC10: Sync External Calendars.
type SyncHandler struct {
	syncService *sync.Service
}

// NewSyncHandler creates a new sync handler.
func NewSyncHandler(syncService *sync.Service) *SyncHandler {
	return &SyncHandler{syncService: syncService}
}

// SyncGoogle triggers a Google Calendar sync for the authenticated user.
// POST /sync/google
func (h *SyncHandler) SyncGoogle(w http.ResponseWriter, r *http.Request) {
	// TODO: extract userID, parse from/to, call syncService.SyncGoogle
}
