package group

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	domaingroup "github.com/fsd-group/fsd/internal/domain/group"
	domainuser "github.com/fsd-group/fsd/internal/domain/user"
)

var ErrGroupOwnerNotFound = errors.New("group owner not found")
var ErrGroupUserNotFound = errors.New("group user not found")
var ErrGroupInviteCodeNotFound = errors.New("group invite code not found")

// Service handles UC2: Create Group & invite via link.
type Service struct {
	groups domaingroup.Repository
	users  domainuser.Repository
}

// NewService creates a new group service.
func NewService(groups domaingroup.Repository, users domainuser.Repository) *Service {
	return &Service{groups: groups, users: users}
}

// CreateGroupInput carries data for creating a new group.
type CreateGroupInput struct {
	Name    string
	OwnerID string
}

// CreateGroup creates a group and returns a shareable invite link (UC2).
func (s *Service) CreateGroup(ctx context.Context, in CreateGroupInput) (*domaingroup.Group, error) {
	if _, err := s.users.FindByID(ctx, in.OwnerID); err != nil {
		return nil, fmt.Errorf("%w: %s", ErrGroupOwnerNotFound, in.OwnerID)
	}

	now := time.Now()

	g := &domaingroup.Group{
		ID:          uuid.New().String(),
		Name:        in.Name,
		InviteCode:  uuid.New().String(),
		CreatedByID: in.OwnerID,
		CreatedAt:   now,
	}

	if err := s.groups.Create(ctx, g); err != nil {
		return nil, fmt.Errorf("create group: %w", err)
	}

	// Add the owner as the first member of the group
	member := &domaingroup.GroupMember{
		ID:       uuid.New().String(),
		GroupID:  g.ID,
		UserID:   in.OwnerID,
		JoinedAt: now,
	}
	if err := s.groups.AddMember(ctx, member); err != nil {
		return nil, fmt.Errorf("add owner as member: %w", err)
	}

	return g, nil
}

// JoinByInvite adds a user to a group via invite code (UC2).
func (s *Service) JoinByInvite(ctx context.Context, inviteCode, userID string) error {
	if _, err := s.users.FindByID(ctx, userID); err != nil {
		return fmt.Errorf("%w: %s", ErrGroupUserNotFound, userID)
	}

	g, err := s.groups.FindByInviteCode(ctx, inviteCode)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			return fmt.Errorf("%w: %s", ErrGroupInviteCodeNotFound, inviteCode)
		}
		return fmt.Errorf("find group by invite code: %w", err)
	}

	// Check if user is already a member
	already, err := s.groups.IsMember(ctx, g.ID, userID)
	if err != nil {
		return fmt.Errorf("check membership: %w", err)
	}
	if already {
		return nil // already a member, nothing to do
	}

	member := &domaingroup.GroupMember{
		ID:       uuid.New().String(),
		GroupID:  g.ID,
		UserID:   userID,
		JoinedAt: time.Now(),
	}
	if err := s.groups.AddMember(ctx, member); err != nil {
		return fmt.Errorf("add member: %w", err)
	}

	return nil
}

// GetGroup returns a single group by ID.
func (s *Service) GetGroup(ctx context.Context, groupID string) (*domaingroup.Group, error) {
	return s.groups.FindByID(ctx, groupID)
}

// ListUserGroups returns all groups a user belongs to.
func (s *Service) ListUserGroups(ctx context.Context, userID string) ([]*domaingroup.Group, error) {
	return s.groups.ListByUser(ctx, userID)
}

// ListMembers returns all members of a group.
func (s *Service) ListMembers(ctx context.Context, groupID string) ([]*domaingroup.GroupMember, error) {
	return s.groups.ListMembers(ctx, groupID)
}

// DeleteGroup removes a group by its ID.
func (s *Service) DeleteGroup(ctx context.Context, groupID string) error {
	return s.groups.Delete(ctx, groupID)
}
