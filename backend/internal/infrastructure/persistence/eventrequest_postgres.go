package persistence

import (
	"context"
	"database/sql"
	"fmt"

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
	var eventID any
	if req.EventID != "" {
		eventID = req.EventID
	}

	_, err := r.db.ExecContext(ctx,
		`INSERT INTO event_requests (id, sender_id, group_id, event_id, title, type, location, note, proposed_start, proposed_end, status, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
		req.ID, req.SenderID, req.GroupID, eventID, req.Title, req.Type, req.Location, req.Note,
		req.ProposedStart, req.ProposedEnd, req.Status, req.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("create event request: %w", err)
	}
	return nil
}

// requestCols lists all event_requests columns prefixed with the "er" alias so the
// constant is safe to use in queries that JOIN other tables (e.g. group_members).
const requestCols = `er.id, er.sender_id, er.group_id, er.event_id, er.title, er.type,
	er.location, er.note, er.proposed_start, er.proposed_end, er.status, er.created_at`

func scanRequest(req *event.EventRequest, scan func(...any) error) error {
	var eventID sql.NullString
	if err := scan(&req.ID, &req.SenderID, &req.GroupID, &eventID, &req.Title, &req.Type,
		&req.Location, &req.Note, &req.ProposedStart, &req.ProposedEnd, &req.Status, &req.CreatedAt); err != nil {
		return err
	}
	req.EventID = eventID.String
	return nil
}

func (r *EventRequestPostgresRepo) FindRequestByID(ctx context.Context, id string) (*event.EventRequest, error) {
	req := &event.EventRequest{}
	err := scanRequest(req, r.db.QueryRowContext(ctx,
		`SELECT `+requestCols+` FROM event_requests er WHERE er.id = $1`, id).Scan)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("event request not found: %s", id)
	}
	if err != nil {
		return nil, fmt.Errorf("find event request by id: %w", err)
	}
	return req, nil
}

func (r *EventRequestPostgresRepo) ListPendingByRecipient(ctx context.Context, recipientID string) ([]*event.EventRequest, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+requestCols+`
		 FROM event_requests er
		 JOIN group_members gm ON gm.group_id = er.group_id
		 WHERE gm.user_id = $1
		   AND er.status = 'pending'
		   AND er.sender_id != $1
		 ORDER BY er.created_at DESC`,
		recipientID,
	)
	if err != nil {
		return nil, fmt.Errorf("list pending event requests by recipient: %w", err)
	}
	defer rows.Close()

	var out []*event.EventRequest
	for rows.Next() {
		req := &event.EventRequest{}
		if err := scanRequest(req, rows.Scan); err != nil {
			return nil, fmt.Errorf("scan event request: %w", err)
		}
		out = append(out, req)
	}
	return out, rows.Err()
}

func (r *EventRequestPostgresRepo) ListByRecipient(ctx context.Context, recipientID string) ([]*event.EventRequest, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+requestCols+`
		 FROM event_requests er
		 JOIN group_members gm ON gm.group_id = er.group_id
		 LEFT JOIN event_request_dismissals d
		        ON d.request_id = er.id AND d.user_id = $1
		 WHERE gm.user_id = $1
		   AND er.sender_id != $1
		   AND d.request_id IS NULL
		 ORDER BY er.created_at DESC`,
		recipientID,
	)
	if err != nil {
		return nil, fmt.Errorf("list event requests by recipient: %w", err)
	}
	defer rows.Close()

	var out []*event.EventRequest
	for rows.Next() {
		req := &event.EventRequest{}
		if err := scanRequest(req, rows.Scan); err != nil {
			return nil, fmt.Errorf("scan event request: %w", err)
		}
		out = append(out, req)
	}
	return out, rows.Err()
}

func (r *EventRequestPostgresRepo) ListBySender(ctx context.Context, senderID string) ([]*event.EventRequest, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT `+requestCols+`
		 FROM event_requests er
		 LEFT JOIN event_request_dismissals d
		        ON d.request_id = er.id AND d.user_id = $1
		 WHERE er.sender_id = $1
		   AND d.request_id IS NULL
		 ORDER BY er.created_at DESC`,
		senderID,
	)
	if err != nil {
		return nil, fmt.Errorf("list event requests by sender: %w", err)
	}
	defer rows.Close()

	var out []*event.EventRequest
	for rows.Next() {
		req := &event.EventRequest{}
		if err := scanRequest(req, rows.Scan); err != nil {
			return nil, fmt.Errorf("scan sender request: %w", err)
		}
		out = append(out, req)
	}
	return out, rows.Err()
}

func (r *EventRequestPostgresRepo) Respond(ctx context.Context, resp *event.EventResponse) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO event_responses (id, request_id, user_id, response, responded_at)
		 VALUES ($1, $2, $3, $4, $5)
		 ON CONFLICT (request_id, user_id) DO UPDATE SET response = EXCLUDED.response,
		 responded_at = EXCLUDED.responded_at`,
		resp.ID, resp.RequestID, resp.UserID, resp.Response, resp.RespondedAt,
	)
	if err != nil {
		return fmt.Errorf("upsert event response: %w", err)
	}
	return nil
}

func (r *EventRequestPostgresRepo) DeleteRequest(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM event_requests WHERE id = $1`, id)
	if err != nil {
		return fmt.Errorf("delete event request: %w", err)
	}
	return nil
}

// DismissRequest records a per-user soft-dismissal. The request row is not touched;
// only this user's list views will exclude it going forward.
func (r *EventRequestPostgresRepo) DismissRequest(ctx context.Context, userID, requestID string) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO event_request_dismissals (user_id, request_id)
		 VALUES ($1, $2)
		 ON CONFLICT (user_id, request_id) DO NOTHING`,
		userID, requestID,
	)
	if err != nil {
		return fmt.Errorf("dismiss event request: %w", err)
	}
	return nil
}

func (r *EventRequestPostgresRepo) UpdateStatus(ctx context.Context, requestID string, status string) error {
	_, err := r.db.ExecContext(ctx,
		`UPDATE event_requests SET status = $1 WHERE id = $2`,
		status, requestID,
	)
	if err != nil {
		return fmt.Errorf("update event request status: %w", err)
	}
	return nil
}

func (r *EventRequestPostgresRepo) ListResponses(ctx context.Context, requestID string) ([]*event.EventResponse, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, request_id, user_id, response, responded_at
		 FROM event_responses WHERE request_id = $1 ORDER BY responded_at`,
		requestID,
	)
	if err != nil {
		return nil, fmt.Errorf("list event responses: %w", err)
	}
	defer rows.Close()

	var out []*event.EventResponse
	for rows.Next() {
		resp := &event.EventResponse{}
		if err := rows.Scan(&resp.ID, &resp.RequestID, &resp.UserID, &resp.Response, &resp.RespondedAt); err != nil {
			return nil, fmt.Errorf("scan event response: %w", err)
		}
		out = append(out, resp)
	}
	return out, rows.Err()
}
