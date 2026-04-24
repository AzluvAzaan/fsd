package user_test

import (
	"context"
	"errors"
	"testing"

	"github.com/fsd-group/fsd/internal/domain/user"
	usecase "github.com/fsd-group/fsd/internal/usecase/user"
)

// stubRepo is an in-memory user.Repository for unit tests.
type stubRepo struct {
	users     map[string]*user.User
	findErr   error
	upsertErr error
	deleteErr error
}

func newStubRepo() *stubRepo {
	return &stubRepo{users: make(map[string]*user.User)}
}

func (s *stubRepo) FindByID(_ context.Context, id string) (*user.User, error) {
	if s.findErr != nil {
		return nil, s.findErr
	}
	u, ok := s.users[id]
	if !ok {
		return nil, errors.New("not found")
	}
	return u, nil
}

func (s *stubRepo) FindByEmail(_ context.Context, email string) (*user.User, error) {
	if s.findErr != nil {
		return nil, s.findErr
	}
	for _, u := range s.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, errors.New("not found")
}

func (s *stubRepo) Upsert(_ context.Context, u *user.User) error {
	if s.upsertErr != nil {
		return s.upsertErr
	}
	s.users[u.ID] = u
	return nil
}

func (s *stubRepo) Delete(_ context.Context, id string) error {
	if s.deleteErr != nil {
		return s.deleteErr
	}
	delete(s.users, id)
	return nil
}

func TestFindByIDReturnsMatchingUser(t *testing.T) {
	repo := newStubRepo()
	repo.users["u1"] = &user.User{ID: "u1", Email: "a@b.com"}
	svc := usecase.NewService(repo)

	got, err := svc.FindByID(context.Background(), "u1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.ID != "u1" {
		t.Errorf("expected u1, got %s", got.ID)
	}
}

func TestFindByIDPropagatesRepoError(t *testing.T) {
	repo := newStubRepo()
	repo.findErr = errors.New("db down")
	svc := usecase.NewService(repo)

	_, err := svc.FindByID(context.Background(), "u1")
	if err == nil {
		t.Error("expected error, got nil")
	}
}

func TestFindByEmailReturnsMatchingUser(t *testing.T) {
	repo := newStubRepo()
	repo.users["u2"] = &user.User{ID: "u2", Email: "test@example.com"}
	svc := usecase.NewService(repo)

	got, err := svc.FindByEmail(context.Background(), "test@example.com")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got.Email != "test@example.com" {
		t.Errorf("expected test@example.com, got %s", got.Email)
	}
}

func TestFindByEmailReturnsErrorWhenNotFound(t *testing.T) {
	svc := usecase.NewService(newStubRepo())

	_, err := svc.FindByEmail(context.Background(), "nobody@example.com")
	if err == nil {
		t.Error("expected error for unknown email, got nil")
	}
}

func TestUpsertPersistsUser(t *testing.T) {
	repo := newStubRepo()
	svc := usecase.NewService(repo)

	u := &user.User{ID: "u3", Email: "new@example.com"}
	if err := svc.Upsert(context.Background(), u); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got, err := svc.FindByID(context.Background(), "u3")
	if err != nil {
		t.Fatalf("user should exist after upsert: %v", err)
	}
	if got.Email != "new@example.com" {
		t.Errorf("expected new@example.com, got %s", got.Email)
	}
}

func TestUpsertPropagatesRepoError(t *testing.T) {
	repo := newStubRepo()
	repo.upsertErr = errors.New("constraint violation")
	svc := usecase.NewService(repo)

	err := svc.Upsert(context.Background(), &user.User{ID: "u3", Email: "x@y.com"})
	if err == nil {
		t.Error("expected error, got nil")
	}
}

func TestDeleteRemovesUser(t *testing.T) {
	repo := newStubRepo()
	repo.users["u4"] = &user.User{ID: "u4", Email: "del@example.com"}
	svc := usecase.NewService(repo)

	if err := svc.Delete(context.Background(), "u4"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := repo.users["u4"]; ok {
		t.Error("user should have been deleted from repo")
	}
}

func TestDeletePropagatesRepoError(t *testing.T) {
	repo := newStubRepo()
	repo.deleteErr = errors.New("foreign key violation")
	svc := usecase.NewService(repo)

	err := svc.Delete(context.Background(), "u4")
	if err == nil {
		t.Error("expected error, got nil")
	}
}
