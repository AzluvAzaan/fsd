package logger

import (
	"log"
	"os"
)

// Logger is a simple structured logger.
// Replace with zerolog, zap, or slog when ready.
type Logger struct {
	info *log.Logger
	warn *log.Logger
	err  *log.Logger
}

// New creates a new Logger.
func New() *Logger {
	return &Logger{
		info: log.New(os.Stdout, "[INFO]  ", log.LstdFlags|log.Lshortfile),
		warn: log.New(os.Stdout, "[WARN]  ", log.LstdFlags|log.Lshortfile),
		err:  log.New(os.Stderr, "[ERROR] ", log.LstdFlags|log.Lshortfile),
	}
}

// Info logs an informational message.
func (l *Logger) Info(msg string, args ...any) {
	l.info.Printf(msg, args...)
}

// Warn logs a warning message.
func (l *Logger) Warn(msg string, args ...any) {
	l.warn.Printf(msg, args...)
}

// Error logs an error message.
func (l *Logger) Error(msg string, args ...any) {
	l.err.Printf(msg, args...)
}
