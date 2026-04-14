package bootstrap

import (
	"fmt"
	"net/http"

	"github.com/fsd-group/fsd/internal/choreographer"
	"github.com/fsd-group/fsd/internal/infrastructure/config"
	"github.com/fsd-group/fsd/internal/infrastructure/google"
	infrahttp "github.com/fsd-group/fsd/internal/infrastructure/http"
	"github.com/fsd-group/fsd/internal/infrastructure/llm"
	infralogger "github.com/fsd-group/fsd/internal/infrastructure/logger"
	"github.com/fsd-group/fsd/internal/infrastructure/persistence"
	"github.com/fsd-group/fsd/internal/interface/rest"
	tginterface "github.com/fsd-group/fsd/internal/interface/telegram"
	"github.com/fsd-group/fsd/internal/usecase/auth"
	"github.com/fsd-group/fsd/internal/usecase/calendar"
	"github.com/fsd-group/fsd/internal/usecase/event"
	"github.com/fsd-group/fsd/internal/usecase/eventrequest"
	"github.com/fsd-group/fsd/internal/usecase/group"
	"github.com/fsd-group/fsd/internal/usecase/notification"
	synccal "github.com/fsd-group/fsd/internal/usecase/sync"
	"github.com/fsd-group/fsd/internal/usecase/telegram"
	"github.com/fsd-group/fsd/internal/usecase/textparser"
	useruc "github.com/fsd-group/fsd/internal/usecase/user"
	"github.com/fsd-group/fsd/pkg/eventbus"
)

// App holds all initialized components of the application.
type App struct {
	Config      *config.Config
	Logger      *infralogger.Logger
	HTTPHandler http.Handler
	TelegramBot *tginterface.BotHandler
}

// Initialize wires all dependencies and returns a ready-to-run App.
func Initialize(cfg *config.Config) (*App, error) {
	log := infralogger.New()

	// --- Infrastructure: external clients ---
	googleClient := google.NewClient(cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.GoogleRedirectURL)
	llmClient := llm.NewClient(cfg.LLMApiKey, cfg.LLMBaseURL, cfg.LLMModel)

	// --- Infrastructure: persistence (PostgreSQL) ---
	db, err := persistence.NewPostgresDB(cfg.DatabaseURL)
	if err != nil {
		return nil, fmt.Errorf("connect to postgres: %w", err)
	}
	log.Info("Connected to PostgreSQL successfully")

	// Postgres-backed repositories
	userRepo := persistence.NewUserPostgresRepo(db)
	groupRepo := persistence.NewGroupPostgresRepo(db)
	eventRepo := persistence.NewEventPostgresRepo(db)
	eventReqRepo := persistence.NewEventRequestPostgresRepo(db)
	notifRepo := persistence.NewNotificationPostgresRepo(db)
	calendarRepo := persistence.NewCalendarPostgresRepo(db)

	// --- Choreographer (microservice choreography layer) ---
	// The event bus decouples services: each service publishes domain events;
	// the choreographer subscribes and triggers cross-service reactions.
	bus := eventbus.New()
	ch := choreographer.New(bus)

	// --- Use cases ---
	authService := auth.NewService(userRepo, googleClient)
	groupService := group.NewService(groupRepo, userRepo)
	calendarService := calendar.NewService(eventRepo, groupRepo)
	eventService := event.NewService(eventRepo, calendarRepo)
	eventReqService := eventrequest.NewService(eventReqRepo, eventRepo, notifRepo, googleClient)
	notifService := notification.NewService(notifRepo)
	syncService := synccal.NewService(eventRepo, calendarRepo, googleClient, nil) // apple connector: nil until configured
	textParserService := textparser.NewService(eventRepo, llmClient, calendarRepo)
	userService := useruc.NewService(userRepo)
	telegramService := telegram.NewService(eventRepo, textParserService, eventReqService)

	// --- Interface: REST handlers ---
	authHandler := rest.NewAuthHandler(authService, cfg.FrontendURL)
	groupHandler := rest.NewGroupHandler(groupService)
	calendarHandler := rest.NewCalendarHandler(calendarService)
	eventHandler := rest.NewEventHandler(eventService, ch)
	eventReqHandler := rest.NewEventRequestHandler(eventReqService, ch)
	notifHandler := rest.NewNotificationHandler(notifService)
	syncHandler := rest.NewSyncHandler(syncService, ch)
	textParserHandler := rest.NewTextParserHandler(textParserService, ch)
	userHandler := rest.NewUserHandler(userService)

	// --- Interface: Telegram bot handler ---
	telegramBot := tginterface.NewBotHandler(telegramService, cfg.TelegramBotToken)

	// --- Interface: API docs handler ---
	docsHandler := rest.NewDocsHandler()

	// --- HTTP router ---
	router := infrahttp.NewRouter(
		authHandler,
		groupHandler,
		calendarHandler,
		eventHandler,
		eventReqHandler,
		notifHandler,
		syncHandler,
		textParserHandler,
		userHandler,
		telegramBot,
		docsHandler,
	)

	log.Info("All dependencies initialized successfully")

	return &App{
		Config:      cfg,
		Logger:      log,
		HTTPHandler: router,
		TelegramBot: telegramBot,
	}, nil
}
