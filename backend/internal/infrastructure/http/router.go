package http

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/interface/rest"
	tginterface "github.com/fsd-group/fsd/internal/interface/telegram"
	"github.com/fsd-group/fsd/pkg/middleware"
)

// NewRouter builds the HTTP router with all REST routes.
func NewRouter(
	authHandler *rest.AuthHandler,
	groupHandler *rest.GroupHandler,
	calendarHandler *rest.CalendarHandler,
	eventHandler *rest.EventHandler,
	eventReqHandler *rest.EventRequestHandler,
	notifHandler *rest.NotificationHandler,
	syncHandler *rest.SyncHandler,
	textParserHandler *rest.TextParserHandler,
	userHandler *rest.UserHandler,
	telegramBot *tginterface.BotHandler,
) http.Handler {
	mux := http.NewServeMux()

	// ---- Auth (UC1) ----
	mux.HandleFunc("GET /auth/google/login", authHandler.GoogleLogin)
	mux.HandleFunc("GET /auth/google/callback", authHandler.GoogleCallback)
	mux.HandleFunc("POST /auth/logout", authHandler.Logout)

	// ---- Groups (UC2) ----
	mux.HandleFunc("POST /groups", middleware.Auth(groupHandler.CreateGroup))
	mux.HandleFunc("POST /groups/join", middleware.Auth(groupHandler.JoinGroup))
	mux.HandleFunc("GET /groups", middleware.Auth(groupHandler.ListGroups))
	mux.HandleFunc("GET /groups/{groupId}/members", middleware.Auth(groupHandler.ListMembers))
	mux.HandleFunc("DELETE /groups/{groupId}", middleware.Auth(groupHandler.DeleteGroup))

	// ---- Calendar (UC3, UC4, UC5) ----
	mux.HandleFunc("GET /calendar", middleware.Auth(calendarHandler.PersonalView))
	mux.HandleFunc("GET /groups/{groupId}/calendar", middleware.Auth(calendarHandler.GroupCalendarView))
	mux.HandleFunc("GET /groups/{groupId}/availability", middleware.Auth(calendarHandler.CheckAvailability))

	// ---- Events (UC6) ----
	mux.HandleFunc("POST /events", middleware.Auth(eventHandler.CreateManualEvent))
	mux.HandleFunc("PUT /events/{eventId}", middleware.Auth(eventHandler.UpdateEvent))
	mux.HandleFunc("DELETE /events/{eventId}", middleware.Auth(eventHandler.DeleteEvent))

	// ---- Event Requests (UC7, UC8) ----
	mux.HandleFunc("POST /event-requests", middleware.Auth(eventReqHandler.SendRequest))
	mux.HandleFunc("POST /event-requests/{requestId}/respond", middleware.Auth(eventReqHandler.Respond))
	mux.HandleFunc("GET /event-requests/pending", middleware.Auth(eventReqHandler.ListPending))

	// ---- Notifications (UC9) ----
	mux.HandleFunc("GET /notifications", middleware.Auth(notifHandler.ListNotifications))
	mux.HandleFunc("POST /notifications/{notificationId}/read", middleware.Auth(notifHandler.MarkRead))

	// ---- Sync (UC10) ----
	mux.HandleFunc("POST /sync/google", middleware.Auth(syncHandler.SyncGoogle))
	mux.HandleFunc("POST /sync/apple", middleware.Auth(syncHandler.SyncApple))

	// ---- Text Parser (UC12) ----
	mux.HandleFunc("POST /events/parse-text", middleware.Auth(textParserHandler.ParseText))

	// ---- Users ----
	mux.HandleFunc("GET /users/{userId}", userHandler.FindByID)
	mux.HandleFunc("GET /users", userHandler.FindByEmail)
	mux.HandleFunc("PUT /users", userHandler.Upsert)
	mux.HandleFunc("DELETE /users/{userId}", userHandler.Delete)

	// ---- Telegram (UC11) ----
	mux.HandleFunc("POST /telegram/webhook", telegramBot.ServeWebhook)

	// Apply global middleware
	handler := middleware.CORS(
		middleware.RequestLogger(
			middleware.Recoverer(mux),
		),
	)

	return handler
}
