package persistence

import (
	"context"
	"crypto/rand"
	"database/sql"
	"fmt"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
)

// CalendarPostgresRepo implements calendar.Repository backed by PostgreSQL.
type CalendarPostgresRepo struct {
	db *sql.DB
}

func NewCalendarPostgresRepo(db *sql.DB) *CalendarPostgresRepo {
	return &CalendarPostgresRepo{db: db}
}

// FindOrCreate returns the user's calendar for the given source, creating it if absent.
func (r *CalendarPostgresRepo) FindOrCreate(ctx context.Context, userID, name, source string) (*domaincal.Calendar, error) {
	cal := &domaincal.Calendar{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, user_id, name, source, is_default, last_synced_at
		 FROM calendars WHERE user_id = $1 AND source = $2 LIMIT 1`,
		userID, source,
	).Scan(&cal.ID, &cal.UserID, &cal.Name, &cal.Source, &cal.IsDefault, &cal.LastSyncedAt)

	if err == nil {
		return cal, nil
	}
	if err != sql.ErrNoRows {
		return nil, fmt.Errorf("find calendar: %w", err)
	}

	cal = &domaincal.Calendar{
		ID:        generateID(),
		UserID:    userID,
		Name:      name,
		Source:    source,
		IsDefault: source == "manual",
	}
	_, err = r.db.ExecContext(ctx,
		`INSERT INTO calendars (id, user_id, name, source, is_default)
		 VALUES ($1, $2, $3, $4, $5)`,
		cal.ID, cal.UserID, cal.Name, cal.Source, cal.IsDefault,
	)
	if err != nil {
		return nil, fmt.Errorf("create calendar: %w", err)
	}
	return cal, nil
}

// generateID returns a random 16-byte hex string suitable for use as a primary key.
func generateID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%x", b)
}
