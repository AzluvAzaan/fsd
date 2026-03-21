package logger

// Package logger in pkg/ provides a logger interface that can be used across
// the application. The concrete implementation lives in internal/infrastructure/logger.
// This keeps the pkg layer dependency-free.

// Logger defines a minimal logging interface.
type Logger interface {
	Info(msg string, args ...any)
	Warn(msg string, args ...any)
	Error(msg string, args ...any)
}
