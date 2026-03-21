package persistence

import (
	"context"
	"database/sql"
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

func (r *EventPostgresRepo) Create(ctx context.Context, e *event.Event) error {
	// TODO: implement
	panic("not implemented")
}

func (r *EventPostgresRepo) FindByID(ctx context.Context, id string) (*event.Event, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *EventPostgresRepo) Update(ctx context.Context, e *event.Event) error {
	// TODO: implement
	panic("not implemented")
}

func (r *EventPostgresRepo) Delete(ctx context.Context, id string) error {
	// TODO: implement
	panic("not implemented")
}

func (r *EventPostgresRepo) ListByUser(ctx context.Context, userID string, from, to time.Time) ([]*event.Event, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *EventPostgresRepo) ListByGroup(ctx context.Context, groupID string, from, to time.Time) ([]*event.Event, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *EventPostgresRepo) BusySlots(ctx context.Context, userIDs []string, from, to time.Time) ([]*event.BusySlot, error) {
	// TODO: implement
	panic("not implemented")
}
