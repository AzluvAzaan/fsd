package persistence

import (
	"context"
	"regexp"
	"testing"
	"time"

	"github.com/DATA-DOG/go-sqlmock"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
)

//	func setupEventRepoMockDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
//		db, mock, err := sqlmock.New()
//		if err != nil {
//			t.Fatalf("sqlmock error: %v", err)
//		}
//		return db, mock
//	}
func TestEventRepo_Create(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	repo := NewEventPostgresRepo(db)

	e := &domainevent.Event{
		ID:         "e1",
		CalendarID: "c1",
		Title:      "Meeting",
		Type:       "meeting",
		StartTime:  time.Now(),
		EndTime:    time.Now().Add(time.Hour),
		Status:     "confirmed",
		Source:     "manual",
		CreatedAt:  time.Now(),
	}

	mock.ExpectExec(regexp.QuoteMeta(
		`INSERT INTO events (id, calendar_id, title, type, start_time, end_time, status, source, request_id, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`),
	).
		WithArgs(
			e.ID, e.CalendarID, e.Title, e.Type,
			e.StartTime, e.EndTime, e.Status,
			e.Source, sqlmock.AnyArg(), e.CreatedAt,
		).
		WillReturnResult(sqlmock.NewResult(1, 1))

	err := repo.Create(context.Background(), e)
	if err != nil {
		t.Fatal(err)
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatal(err)
	}
}
func TestEventRepo_FindByID(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	repo := NewEventPostgresRepo(db)

	rows := sqlmock.NewRows([]string{
		"id", "calendar_id", "title", "type",
		"start_time", "end_time", "status", "source",
		"request_id", "created_at",
	}).AddRow(
		"e1", "c1", "Meeting", "meeting",
		time.Now(), time.Now(), "confirmed", "manual",
		"", time.Now(),
	)

	mock.ExpectQuery(regexp.QuoteMeta(`SELECT`)).
		WithArgs("e1").
		WillReturnRows(rows)

	e, err := repo.FindByID(context.Background(), "e1")
	if err != nil {
		t.Fatal(err)
	}

	if e.ID != "e1" {
		t.Errorf("expected e1 got %s", e.ID)
	}
}
func TestEventRepo_UpdateStatusByRequestID(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	repo := NewEventPostgresRepo(db)

	mock.ExpectExec(regexp.QuoteMeta(
		`UPDATE events SET status = $1 WHERE request_id = $2`,
	)).
		WithArgs("confirmed", "req1").
		WillReturnResult(sqlmock.NewResult(0, 3))

	err := repo.UpdateStatusByRequestID(context.Background(), "req1", "confirmed")
	if err != nil {
		t.Fatal(err)
	}
}
func TestEventRepo_DeleteByRequestID(t *testing.T) {
	db, mock := setupMockDB(t)
	defer db.Close()

	repo := NewEventPostgresRepo(db)

	mock.ExpectExec(regexp.QuoteMeta(
		`DELETE FROM events WHERE request_id = $1 AND status != 'confirmed'`,
	)).
		WithArgs("req1").
		WillReturnResult(sqlmock.NewResult(0, 2))

	err := repo.DeleteByRequestID(context.Background(), "req1")
	if err != nil {
		t.Fatal(err)
	}
}
