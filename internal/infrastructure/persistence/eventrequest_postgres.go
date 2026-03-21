package persistence

import (
	"context"
	"database/sql"

	"github.com/fsd-group/fsd/internal/domain/event"
)

// EventRequestPostgresRepo implements event.RequestRepository backed by PostgreSQL.
type EventRequestPostgresRepo struct {
	db *sql.DB
}

func NewEventRequestPostgresRepo(db *sql.DB) *EventRequestPostgresRepo {
	return &EventRequestPostgresRepo{db: db}
}

func (r *EventRequestPostgresRepo) CreateRequest(ctx context.Context, req *event.EventRequest) error {
	// TODO: implement
	panic("not implemented")
}

func (r *EventRequestPostgresRepo) FindRequestByID(ctx context.Context, id string) (*event.EventRequest, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *EventRequestPostgresRepo) ListPendingByRecipient(ctx context.Context, recipientID string) ([]*event.EventRequest, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *EventRequestPostgresRepo) Respond(ctx context.Context, resp *event.EventResponse) error {
	// TODO: implement
	panic("not implemented")
}

func (r *EventRequestPostgresRepo) ListResponses(ctx context.Context, requestID string) ([]*event.EventResponse, error) {
	// TODO: implement
	panic("not implemented")
}
