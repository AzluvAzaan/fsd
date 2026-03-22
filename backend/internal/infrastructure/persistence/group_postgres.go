package persistence

import (
	"context"
	"database/sql"

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
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) FindByID(ctx context.Context, id string) (*group.Group, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) FindByInviteCode(ctx context.Context, code string) (*group.Group, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) ListByUser(ctx context.Context, userID string) ([]*group.Group, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) Delete(ctx context.Context, id string) error {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) AddMember(ctx context.Context, m *group.GroupMember) error {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) RemoveMember(ctx context.Context, groupID, userID string) error {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) ListMembers(ctx context.Context, groupID string) ([]*group.GroupMember, error) {
	// TODO: implement
	panic("not implemented")
}

func (r *GroupPostgresRepo) IsMember(ctx context.Context, groupID, userID string) (bool, error) {
	// TODO: implement
	panic("not implemented")
}
