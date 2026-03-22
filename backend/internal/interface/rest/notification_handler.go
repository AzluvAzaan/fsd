package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/notification"
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
	// TODO: extract userID from context, call notifService.List
}

// MarkRead marks a notification as read.
// POST /notifications/{notificationId}/read
func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	// TODO: extract notificationId, call notifService.MarkRead
}
