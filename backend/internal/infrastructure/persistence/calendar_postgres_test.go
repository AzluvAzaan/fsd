package persistence

import (
	"context"
	"database/sql"
	"regexp"
	"testing"
	"time"

	// domaincal "github.com/fsd-group/fsd/internal/domain/calendar"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
)

func setupMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	return db, mock
}
func TestFindOrCreate_ReturnsExistingCalendar(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	repo := NewCalendarPostgresRepo(db)

	rows := sqlmock.NewRows([]string{
		"id", "user_id", "name", "source", "is_default", "last_synced_at",
	}).AddRow(
		"cal-123", "user1", "work", "google", false, time.Now(),
	)

	mock.ExpectQuery(regexp.QuoteMeta(
		`SELECT id, user_id, name, source, is_default, last_synced_at
		 FROM calendars WHERE user_id = $1 AND source = $2 LIMIT 1`,
	)).
		WithArgs("user1", "google").
		WillReturnRows(rows)

	cal, err := repo.FindOrCreate(context.Background(), "user1", "work", "google")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cal.ID != "cal-123" {
		t.Errorf("expected cal-123, got %s", cal.ID)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestFindOrCreate_CreatesNewCalendar(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	repo := NewCalendarPostgresRepo(db)

	// 1. SELECT returns no rows
	mock.ExpectQuery(regexp.QuoteMeta(
		`SELECT id, user_id, name, source, is_default, last_synced_at
		 FROM calendars WHERE user_id = $1 AND source = $2 LIMIT 1`,
	)).
		WithArgs("user1", "google").
		WillReturnError(sql.ErrNoRows)

	// 2. INSERT expectation
	mock.ExpectExec(regexp.QuoteMeta(
		`INSERT INTO calendars (id, user_id, name, source, is_default)
		 VALUES ($1, $2, $3, $4, $5)`,
	)).
		WithArgs(
			sqlmock.AnyArg(), // generated ID
			"user1",
			"work",
			"google",
			false,
		).
		WillReturnResult(sqlmock.NewResult(1, 1))

	cal, err := repo.FindOrCreate(context.Background(), "user1", "work", "google")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cal.UserID != "user1" {
		t.Errorf("expected user1, got %s", cal.UserID)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}
