package persistence

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/fsd-group/fsd/internal/domain/group"
)

// GroupPostgresRepo implements group.Repository backed by PostgreSQL.
type GroupPostgresRepo struct {
	db *sql.DB
}

func NewGroupPostgresRepo(db *sql.DB) *GroupPostgresRepo {
	return &GroupPostgresRepo{db: db}
}

func (r *GroupPostgresRepo) Create(ctx context.Context, g *group.Group) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO groups (id, name, invite_link, created_by_id, created_at)
		 VALUES ($1, $2, $3, $4, $5)`,
		g.ID, g.Name, g.InviteLink, g.CreatedByID, g.CreatedAt,
	)
	return err
}

func (r *GroupPostgresRepo) FindByID(ctx context.Context, id string) (*group.Group, error) {
	g := &group.Group{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, invite_link, created_by_id, created_at
		 FROM groups WHERE id = $1`, id,
	).Scan(&g.ID, &g.Name, &g.InviteLink, &g.CreatedByID, &g.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("group not found: %s", id)
	}
	return g, err
}

func (r *GroupPostgresRepo) FindByInviteCode(ctx context.Context, code string) (*group.Group, error) {
	g := &group.Group{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, invite_link, created_by_id, created_at
		 FROM groups WHERE invite_link = $1`, code,
	).Scan(&g.ID, &g.Name, &g.InviteLink, &g.CreatedByID, &g.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("group not found for invite code: %s", code)
	}
	return g, err
}

func (r *GroupPostgresRepo) ListByUser(ctx context.Context, userID string) ([]*group.Group, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT g.id, g.name, g.invite_link, g.created_by_id, g.created_at
		 FROM groups g
		 INNER JOIN group_members gm ON g.id = gm.group_id
		 WHERE gm.user_id = $1
		 ORDER BY g.created_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var groups []*group.Group
	for rows.Next() {
		g := &group.Group{}
		if err := rows.Scan(&g.ID, &g.Name, &g.InviteLink, &g.CreatedByID, &g.CreatedAt); err != nil {
			return nil, err
		}
		groups = append(groups, g)
	}
	return groups, rows.Err()
}

func (r *GroupPostgresRepo) Delete(ctx context.Context, id string) error {
	result, err := r.db.ExecContext(ctx, `DELETE FROM groups WHERE id = $1`, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return fmt.Errorf("group not found: %s", id)
	}
	return nil
}

func (r *GroupPostgresRepo) AddMember(ctx context.Context, m *group.GroupMember) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO group_members (id, group_id, user_id, joined_at)
		 VALUES ($1, $2, $3, $4)
		 ON CONFLICT (group_id, user_id) DO NOTHING`,
		m.ID, m.GroupID, m.UserID, m.JoinedAt,
	)
	return err
}

func (r *GroupPostgresRepo) RemoveMember(ctx context.Context, groupID, userID string) error {
	_, err := r.db.ExecContext(ctx,
		`DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
		groupID, userID,
	)
	return err
}

func (r *GroupPostgresRepo) ListMembers(ctx context.Context, groupID string) ([]*group.GroupMember, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, group_id, user_id, joined_at FROM group_members WHERE group_id = $1 ORDER BY joined_at`, groupID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*group.GroupMember
	for rows.Next() {
		m := &group.GroupMember{}
		if err := rows.Scan(&m.ID, &m.GroupID, &m.UserID, &m.JoinedAt); err != nil {
			return nil, err
		}
		members = append(members, m)
	}
	return members, rows.Err()
}

func (r *GroupPostgresRepo) IsMember(ctx context.Context, groupID, userID string) (bool, error) {
	var exists bool
	err := r.db.QueryRowContext(ctx,
		`SELECT EXISTS(SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2)`,
		groupID, userID,
	).Scan(&exists)
	return exists, err
}
