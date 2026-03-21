package group

import "context"

// Repository defines the persistence contract for groups and memberships.
type Repository interface {
	// --- Group CRUD ---

	Create(ctx context.Context, g *Group) error
	FindByID(ctx context.Context, id string) (*Group, error)
	FindByInviteCode(ctx context.Context, code string) (*Group, error)
	ListByUser(ctx context.Context, userID string) ([]*Group, error)
	Delete(ctx context.Context, id string) error

	// --- Membership ---

	AddMember(ctx context.Context, m *GroupMember) error
	RemoveMember(ctx context.Context, groupID, userID string) error
	ListMembers(ctx context.Context, groupID string) ([]*GroupMember, error)
	IsMember(ctx context.Context, groupID, userID string) (bool, error)
}
