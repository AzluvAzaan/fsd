package config

import (
	"fmt"
	"log"
	"net/url"
	"os"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	// Server
	ServerPort string

	// Database
	DatabaseURL string

	// Google OAuth2 + APIs
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string

	// LLM API (for UC12: text parsing)
	LLMApiKey  string
	LLMBaseURL string
	LLMModel   string

	// Telegram Bot (for UC11)
	TelegramBotToken string

	// Frontend URL (for post-OAuth redirects)
	FrontendURL string
}

// Load reads configuration from environment variables (or .env file).
func Load() (*Config, error) {
	dbURL := getEnv("DATABASE_URL", "")
	if dbURL == "" {
		dbURL = buildDatabaseURL()
	}

	cfg := &Config{
		ServerPort:         getEnv("SERVER_PORT", "8080"),
		DatabaseURL:        dbURL,
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", "http://localhost:8080/auth/google/callback"),
		LLMApiKey:          getEnv("LLM_API_KEY", ""),
		LLMBaseURL:         getEnv("LLM_BASE_URL", "https://api.openai.com/v1"),
		LLMModel:           getEnv("LLM_MODEL", "gpt-4"),
		TelegramBotToken:   getEnv("TELEGRAM_BOT_TOKEN", ""),
		FrontendURL:        getEnv("FRONTEND_URL", "http://localhost:3000"),
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("[FATAL] DATABASE_URL is not set. Set it in your .env file or set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.")
	}

	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" {
		log.Println("[WARN] GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET are not set — Google OAuth/Calendar/Gmail features will not work")
	}

	return cfg, nil
}

// buildDatabaseURL constructs a connection string from individual DB_* env vars.
// This avoids URL-encoding issues when passwords contain special characters.
func buildDatabaseURL() string {
	host := getEnv("DB_HOST", "")
	if host == "" {
		return ""
	}
	port := getEnv("DB_PORT", "6543")
	user := getEnv("DB_USER", "postgres")
	pass := getEnv("DB_PASSWORD", "")
	name := getEnv("DB_NAME", "postgres")
	sslMode := getEnv("DB_SSLMODE", "require")

	u := &url.URL{
		Scheme:   "postgresql",
		User:     url.UserPassword(user, pass),
		Host:     fmt.Sprintf("%s:%s", host, port),
		Path:     name,
		RawQuery: fmt.Sprintf("sslmode=%s", sslMode),
	}
	return u.String()
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}
