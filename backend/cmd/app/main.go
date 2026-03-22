package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/fsd-group/fsd/internal/bootstrap"
	"github.com/fsd-group/fsd/internal/infrastructure/config"
	"github.com/fsd-group/fsd/pkg/utils"
)

func main() {
	// Load .env file (optional, won't override existing env vars)
	if err := utils.LoadEnvFile(".env"); err != nil {
		log.Fatalf("failed to load .env file: %v", err)
	}

	// Load configuration from environment / .env
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	// Initialize all dependencies
	app, err := bootstrap.Initialize(cfg)
	if err != nil {
		log.Fatalf("failed to initialize app: %v", err)
	}

	// Create HTTP server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.ServerPort),
		Handler:      app.HTTPHandler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		app.Logger.Info("Starting server on :%s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	app.Logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}

	app.Logger.Info("Server stopped")
}
