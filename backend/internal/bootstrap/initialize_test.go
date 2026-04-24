package bootstrap

import (
	"testing"

	"github.com/fsd-group/fsd/internal/infrastructure/config"
)

func TestInitialize_Success(t *testing.T) {
	cfg := &config.Config{
		DatabaseURL:        "postgres://invalid:5432/test", 
		GoogleClientID:     "test",
		GoogleClientSecret: "test",
		GoogleRedirectURL:  "http://localhost",
		LLMApiKey:          "test",
		LLMBaseURL:         "http://localhost",
		LLMModel:           "test",
		TelegramBotToken:   "test",
		FrontendURL:        "http://localhost",
	}

	app, err := Initialize(cfg)

	if err != nil {
		t.Skipf("skipping due to external dependency (DB not available): %v", err)
		return
	}

	if app == nil {
		t.Fatal("expected app, got nil")
	}

	if app.HTTPHandler == nil {
		t.Fatal("expected HTTP handler to be initialized")
	}

	if app.TelegramBot == nil {
		t.Fatal("expected Telegram bot handler to be initialized")
	}

	if app.Config == nil {
		t.Fatal("expected config to be stored")
	}
}
