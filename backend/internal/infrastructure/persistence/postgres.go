package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// openDB opens a PostgreSQL connection pool.
// default_query_exec_mode=simple_protocol disables pgx's per-connection prepared
// statement cache, which causes "prepared statement already exists" errors when
// multiple connections execute the same query concurrently.
func openDB(databaseURL string) (*sql.DB, error) {
	if !strings.Contains(databaseURL, "default_query_exec_mode") {
		sep := "?"
		if strings.Contains(databaseURL, "?") {
			sep = "&"
		}
		databaseURL += sep + "default_query_exec_mode=simple_protocol"
	}
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open postgres: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}

// NewPostgresDB opens a connection pool to PostgreSQL and runs schema migration.
func NewPostgresDB(databaseURL string) (*sql.DB, error) {
	db, err := openDB(databaseURL)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	if err := migrate(ctx, db); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}

	return db, nil
}

// NewPostgresDBNoMigrate opens a connection pool without running the inline migration.
// Used by the cmd/migrate tool which runs its own SQL files.
func NewPostgresDBNoMigrate(databaseURL string) (*sql.DB, error) {
	db, err := openDB(databaseURL)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return db, nil
}

func migrate(ctx context.Context, db *sql.DB) error {
	_, err := db.ExecContext(ctx, `
	CREATE TABLE IF NOT EXISTS users (
		id               TEXT        PRIMARY KEY,
		email            TEXT        UNIQUE NOT NULL,
		display_name     TEXT        NOT NULL DEFAULT '',
		gmail_token      TEXT        NOT NULL DEFAULT '',
		telegram_chat_id TEXT        NOT NULL DEFAULT '',
		created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS groups (
		id            TEXT        PRIMARY KEY,
		name          TEXT        NOT NULL,
		invite_code   TEXT        UNIQUE NOT NULL,
		created_by_id TEXT        NOT NULL REFERENCES users(id),
		created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS group_members (
		id        TEXT        PRIMARY KEY,
		group_id  TEXT        NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
		user_id   TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE (group_id, user_id)
	);

	CREATE TABLE IF NOT EXISTS calendars (
		id             TEXT        PRIMARY KEY,
		user_id        TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		name           TEXT        NOT NULL,
		source         TEXT        NOT NULL DEFAULT 'manual',
		is_default     BOOLEAN     NOT NULL DEFAULT FALSE,
		last_synced_at TIMESTAMPTZ
	);

	CREATE TABLE IF NOT EXISTS events (
		id          TEXT        PRIMARY KEY,
		calendar_id TEXT        NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
		title       TEXT        NOT NULL,
		type        TEXT        NOT NULL DEFAULT '',
		start_time  TIMESTAMPTZ NOT NULL,
		end_time    TIMESTAMPTZ NOT NULL,
		status      TEXT        NOT NULL DEFAULT 'confirmed',
		source      TEXT        NOT NULL DEFAULT 'manual',
		created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS event_requests (
		id             TEXT        PRIMARY KEY,
		sender_id      TEXT        NOT NULL REFERENCES users(id),
		group_id       TEXT        NOT NULL REFERENCES groups(id),
		event_id       TEXT        NOT NULL REFERENCES events(id),
		title          TEXT        NOT NULL DEFAULT '',
		type           TEXT        NOT NULL DEFAULT '',
		proposed_start TIMESTAMPTZ NOT NULL,
		proposed_end   TIMESTAMPTZ NOT NULL,
		status         TEXT        NOT NULL DEFAULT 'pending',
		created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS event_responses (
		id           TEXT        PRIMARY KEY,
		request_id   TEXT        NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
		user_id      TEXT        NOT NULL REFERENCES users(id),
		response     TEXT        NOT NULL,
		responded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		UNIQUE (request_id, user_id)
	);

	CREATE TABLE IF NOT EXISTS notifications (
		id         TEXT        PRIMARY KEY,
		user_id    TEXT        NOT NULL REFERENCES users(id),
		request_id TEXT        REFERENCES event_requests(id) ON DELETE SET NULL,
		type       TEXT        NOT NULL DEFAULT '',
		sent_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		channel    TEXT        NOT NULL DEFAULT 'in_app'
	);
	`)
	return err
}
