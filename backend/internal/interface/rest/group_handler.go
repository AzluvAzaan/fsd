package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/group"
)

// GroupHandler handles HTTP requests for UC2: Create Group & invite via link.
type GroupHandler struct {
	groupService *group.Service
}

// NewGroupHandler creates a new group handler.
func NewGroupHandler(groupService *group.Service) *GroupHandler {
	return &GroupHandler{groupService: groupService}
}

// CreateGroup creates a new group.
// POST /groups
func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	// TODO: parse body, call groupService.CreateGroup, return group with invite link
}

// JoinGroup adds the authenticated user to a group via invite code.
// POST /groups/join?code=...
func (h *GroupHandler) JoinGroup(w http.ResponseWriter, r *http.Request) {
	// TODO: extract code, call groupService.JoinByInvite
}

// ListGroups returns all groups for the authenticated user.
// GET /groups
func (h *GroupHandler) ListGroups(w http.ResponseWriter, r *http.Request) {
	// TODO: call groupService.ListUserGroups
}

// ListMembers returns all members of a group.
// GET /groups/{groupId}/members
func (h *GroupHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	// TODO: call groupService.ListMembers
}
