package persistence

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/fsd-group/fsd/internal/domain/event"
)

// EventPostgresRepo implements event.Repository backed by PostgreSQL.
type EventPostgresRepo struct {
	db *sql.DB
}

func NewEventPostgresRepo(db *sql.DB) *EventPostgresRepo {
	return &EventPostgresRepo{db: db}
}

const eventCols = `e.id, e.calendar_id, e.title, e.type, e.start_time, e.end_time, e.status, e.source, e.created_at`

func scanEvent(row interface{ Scan(...any) error }) (*event.Event, error) {
	e := &event.Event{}
	return e, row.Scan(&e.ID, &e.CalendarID, &e.Title, &e.Type, &e.StartTime, &e.EndTime, &e.Status, &e.Source, &e.CreatedAt)
}

func collectEvents(rows *sql.Rows) ([]*event.Event, error) {
	var events []*event.Event
	for rows.Next() {
		e := &event.Event{}
		if err := rows.Scan(&e.ID, &e.CalendarID, &e.Title, &e.Type, &e.StartTime, &e.EndTime, &e.Status, &e.Source, &e.CreatedAt); err != nil {
			return nil, err
		}
		events = append(events, e)
	}
	return events, rows.Err()
}

func (r *EventPostgresRepo) Create(ctx context.Context, e *event.Event) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO events (id, calendar_id, title, type, start_time, end_time, status, source, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
		e.ID, e.CalendarID, e.Title, e.Type, e.StartTime, e.EndTime, e.Status, e.Source, e.CreatedAt,
	)
	return err
}

func (r *EventPostgresRepo) Upsert(ctx context.Context, e *event.Event) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO events (id, calendar_id, title, type, start_time, end_time, status, source, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		 ON CONFLICT (id) DO UPDATE SET
		     title      = EXCLUDED.title,
		     start_time = EXCLUDED.start_time,
		     end_time   = EXCLUDED.end_time,
		     status     = EXCLUDED.status`,
		e.ID, e.CalendarID, e.Title, e.Type, e.StartTime, e.EndTime, e.Status, e.Source, e.CreatedAt,
	)
	return err
}

func (r *EventPostgresRepo) FindByID(ctx context.Context, id string) (*event.Event, error) {
	row := r.db.QueryRowContext(ctx,
		`SELECT `+eventCols+` FROM events e WHERE e.id = $1`, id)
	e, err := scanEvent(row)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("event not found: %s", id)
	}
	return e, err
}

func (r *EventPostgresRepo) Update(ctx context.Context, e *event.Event) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE events SET title=$1, type=$2, start_time=$3, end_time=$4, status=$5
		 WHERE id=$6`,
		e.Title, e.Type, e.StartTime, e.EndTime, e.Status, e.ID,
	)
	return err
}

func (r *EventPostgresRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM events WHERE id = $1`, id)
	return err
}

// ListByUser returns all events across every calendar owned by userID in [from, to].
// Events from all sources (manual, google, apple) are included.
func (r *EventPostgresRepo) ListByUser(ctx context.Context, userID string, from, to time.Time) ([]*event.Event, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+eventCols+`
		 FROM events e
		 JOIN calendars c ON e.calendar_id = c.id
		 WHERE c.user_id = $1
		   AND e.start_time >= $2
		   AND e.end_time   <= $3
		 ORDER BY e.start_time`,
		userID, from, to,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectEvents(rows)
}

// ListByGroup returns events that were created as part of an event request for groupID.
func (r *EventPostgresRepo) ListByGroup(ctx context.Context, groupID string, from, to time.Time) ([]*event.Event, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+eventCols+`
		 FROM events e
		 JOIN event_requests er ON er.event_id = e.id
		 WHERE er.group_id = $1
		   AND e.start_time >= $2
		   AND e.end_time   <= $3
		 ORDER BY e.start_time`,
		groupID, from, to,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return collectEvents(rows)
}

// BusySlots returns confirmed event time ranges for the given set of users.
// Used by the Availability Engine (UC4, UC5) to compute busy blocks.
func (r *EventPostgresRepo) BusySlots(ctx context.Context, userIDs []string, from, to time.Time) ([]*event.BusySlot, error) {
	if len(userIDs) == 0 {
		return nil, nil
	}

	// Build a dynamic IN clause: $1, $2, ... $N
	placeholders := make([]string, len(userIDs))
	args := make([]any, len(userIDs)+2)
	for i, id := range userIDs {
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		args[i] = id
	}
	args[len(userIDs)] = from
	args[len(userIDs)+1] = to

	query := fmt.Sprintf(
		`SELECT c.user_id, e.start_time, e.end_time
		 FROM events e
		 JOIN calendars c ON e.calendar_id = c.id
		 WHERE c.user_id IN (%s)
		   AND e.start_time >= $%d
		   AND e.end_time   <= $%d
		   AND e.status = 'confirmed'
		 ORDER BY c.user_id, e.start_time`,
		strings.Join(placeholders, ", "),
		len(userIDs)+1,
		len(userIDs)+2,
	)

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var slots []*event.BusySlot
	for rows.Next() {
		s := &event.BusySlot{}
		if err := rows.Scan(&s.UserID, &s.StartTime, &s.EndTime); err != nil {
			return nil, err
		}
		slots = append(slots, s)
	}
	return slots, rows.Err()
}
