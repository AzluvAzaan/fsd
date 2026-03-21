package group

import (
	"context"

	domaingroup "github.com/fsd-group/fsd/internal/domain/group"
)

// Service handles UC2: Create Group & invite via link.
type Service struct {
	groups domaingroup.Repository
}

// NewService creates a new group service.
func NewService(groups domaingroup.Repository) *Service {
	return &Service{groups: groups}
}

// CreateGroupInput carries data for creating a new group.
type CreateGroupInput struct {
	Name    string
	OwnerID string
}

// CreateGroup creates a group and returns a shareable invite link (UC2).
func (s *Service) CreateGroup(ctx context.Context, in CreateGroupInput) (*domaingroup.Group, error) {
	// TODO: implement — create group, generate invite code, add owner as member
	return nil, nil
}

// JoinByInvite adds a user to a group via invite code (UC2).
func (s *Service) JoinByInvite(ctx context.Context, inviteCode, userID string) error {
	// TODO: implement — look up group by code, add membership
	return nil
}

// ListUserGroups returns all groups a user belongs to.
func (s *Service) ListUserGroups(ctx context.Context, userID string) ([]*domaingroup.Group, error) {
	return s.groups.ListByUser(ctx, userID)
}

// ListMembers returns all members of a group.
func (s *Service) ListMembers(ctx context.Context, groupID string) ([]*domaingroup.GroupMember, error) {
	return s.groups.ListMembers(ctx, groupID)
}
