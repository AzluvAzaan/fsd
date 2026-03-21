package rest

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/fsd-group/fsd/internal/domain/user"
	useruc "github.com/fsd-group/fsd/internal/usecase/user"
	"github.com/fsd-group/fsd/pkg/response"
)

// UserHandler handles HTTP requests for user management.
type UserHandler struct {
	userService *useruc.Service
}

// NewUserHandler creates a new user handler.
func NewUserHandler(userService *useruc.Service) *UserHandler {
	return &UserHandler{userService: userService}
}

// FindByID retrieves a user by their ID.
// GET /users/{userId}
func (h *UserHandler) FindByID(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	if userID == "" {
		response.Error(w, http.StatusBadRequest, "userId is required")
		return
	}

	u, err := h.userService.FindByID(r.Context(), userID)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.Success(w, u)
}

// FindByEmail retrieves a user by their email address.
// GET /users?email=...
func (h *UserHandler) FindByEmail(w http.ResponseWriter, r *http.Request) {
	email := r.URL.Query().Get("email")
	if email == "" {
		response.Error(w, http.StatusBadRequest, "email query parameter is required")
		return
	}

	u, err := h.userService.FindByEmail(r.Context(), email)
	if err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}

	response.Success(w, u)
}

// upsertRequest is the request body for creating/updating a user.
type upsertRequest struct {
	ID             string `json:"id"`
	Email          string `json:"email"`
	DisplayName    string `json:"displayName"`
	GmailToken     string `json:"gmailToken"`
	TelegramChatID string `json:"telegramChatId"`
}

// Upsert creates or updates a user.
// PUT /users
func (h *UserHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	var req upsertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.ID == "" || req.Email == "" {
		response.Error(w, http.StatusBadRequest, "id and email are required")
		return
	}

	u := &user.User{
		ID:             req.ID,
		Email:          req.Email,
		DisplayName:    req.DisplayName,
		GmailToken:     req.GmailToken,
		TelegramChatID: req.TelegramChatID,
		CreatedAt:      time.Now(),
	}

	if err := h.userService.Upsert(r.Context(), u); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Success(w, u)
}

// Delete removes a user by their ID.
// DELETE /users/{userId}
func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("userId")
	if userID == "" {
		response.Error(w, http.StatusBadRequest, "userId is required")
		return
	}

	if err := h.userService.Delete(r.Context(), userID); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.NoContent(w)
}
