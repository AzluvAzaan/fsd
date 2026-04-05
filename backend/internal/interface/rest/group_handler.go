package rest

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"github.com/fsd-group/fsd/internal/usecase/group"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// GroupHandler handles HTTP requests for UC2: Create Group & invite via link.
type GroupHandler struct {
	groupService *group.Service
}

// NewGroupHandler creates a new group handler.
func NewGroupHandler(groupService *group.Service) *GroupHandler {
	return &GroupHandler{groupService: groupService}
}

// createGroupRequest is the request body for creating a group.
type createGroupRequest struct {
	Name string `json:"name"`
}

// CreateGroup creates a new group.
// POST /groups
func (h *GroupHandler) CreateGroup(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req createGroupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Name == "" {
		response.Error(w, http.StatusBadRequest, "name is required")
		return
	}

	g, err := h.groupService.CreateGroup(r.Context(), group.CreateGroupInput{
		Name:    req.Name,
		OwnerID: userID,
	})
	if err != nil {
		if errors.Is(err, group.ErrGroupOwnerNotFound) {
			response.Error(w, http.StatusNotFound, "user not found, create user first")
			return
		}
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Created(w, g)
}

// JoinGroup adds the authenticated user to a group via invite code.
// POST /groups/join?code=...
func (h *GroupHandler) JoinGroup(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	code := r.URL.Query().Get("code")
	if code == "" {
		response.Error(w, http.StatusBadRequest, "code query parameter is required")
		return
	}

	if err := h.groupService.JoinByInvite(r.Context(), code, userID); err != nil {
		if errors.Is(err, group.ErrGroupUserNotFound) {
			response.Error(w, http.StatusNotFound, "user not found, create user first")
			return
		}
		if errors.Is(err, group.ErrGroupInviteCodeNotFound) {
			response.Error(w, http.StatusNotFound, "invite code not found")
			return
		}
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, map[string]string{"message": "joined group successfully"})
}

// ListGroups returns all groups for the authenticated user.
// GET /groups
func (h *GroupHandler) ListGroups(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	groups, err := h.groupService.ListUserGroups(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	if groups == nil {
		response.Success(w, []any{})
		return
	}

	response.Success(w, groups)
}

// ListMembers returns all members of a group.
// GET /groups/{groupId}/members
func (h *GroupHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	groupID := r.PathValue("groupId")
	if groupID == "" {
		response.Error(w, http.StatusBadRequest, "groupId is required")
		return
	}

	members, err := h.groupService.ListMembers(r.Context(), groupID)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, members)
}

// DeleteGroup deletes a group by its ID.
// DELETE /groups/{groupId}
func (h *GroupHandler) DeleteGroup(w http.ResponseWriter, r *http.Request) {
	groupID := r.PathValue("groupId")
	if groupID == "" {
		response.Error(w, http.StatusBadRequest, "groupId is required")
		return
	}

	if err := h.groupService.DeleteGroup(r.Context(), groupID); err != nil {
		if strings.Contains(err.Error(), "not found") {
			response.Error(w, http.StatusNotFound, err.Error())
		} else {
			response.Error(w, http.StatusInternalServerError, err.Error())
		}
		return
	}

	response.Success(w, map[string]string{"message": "group deleted successfully"})
}
