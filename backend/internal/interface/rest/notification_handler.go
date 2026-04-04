package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/notification"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// NotificationHandler handles HTTP requests for UC9: Notifications.
type NotificationHandler struct {
	notifService *notification.Service
}

// NewNotificationHandler creates a new notification handler.
func NewNotificationHandler(notifService *notification.Service) *NotificationHandler {
	return &NotificationHandler{notifService: notifService}
}

// ListNotifications returns all notifications for the authenticated user.
// GET /notifications
func (h *NotificationHandler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	list, err := h.notifService.List(r.Context(), userID)
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

// MarkRead marks a notification as read.
// POST /notifications/{notificationId}/read
func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	notificationID := r.PathValue("notificationId")
	if notificationID == "" {
		response.Error(w, http.StatusBadRequest, "notificationId is required")
		return
	}

	if err := h.notifService.MarkRead(r.Context(), notificationID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, map[string]string{"message": "notification marked as read"})
}
