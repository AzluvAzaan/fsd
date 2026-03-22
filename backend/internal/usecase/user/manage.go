package user

import (
	"context"

	"github.com/fsd-group/fsd/internal/domain/user"
)

// Service provides user management operations.
type Service struct {
	repo user.Repository
}

// NewService creates a new user management service.
func NewService(repo user.Repository) *Service {
	return &Service{repo: repo}
}

// FindByID retrieves a user by their ID.
func (s *Service) FindByID(ctx context.Context, id string) (*user.User, error) {
	return s.repo.FindByID(ctx, id)
}

// FindByEmail retrieves a user by their email address.
func (s *Service) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	return s.repo.FindByEmail(ctx, email)
}

// Upsert creates or updates a user.
func (s *Service) Upsert(ctx context.Context, u *user.User) error {
	return s.repo.Upsert(ctx, u)
}

// Delete removes a user by their ID.
func (s *Service) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
