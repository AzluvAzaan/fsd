package rest_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/fsd-group/fsd/internal/domain/user"
	"github.com/fsd-group/fsd/internal/interface/rest"
	usecase "github.com/fsd-group/fsd/internal/usecase/user"
)

// stubUserRepo is an in-memory user.Repository for handler tests.
type stubUserRepo struct {
	users     map[string]*user.User
	findErr   error
	upsertErr error
	deleteErr error
}

func newStubUserRepo() *stubUserRepo {
	return &stubUserRepo{users: make(map[string]*user.User)}
}

func (s *stubUserRepo) FindByID(_ context.Context, id string) (*user.User, error) {
	if s.findErr != nil {
		return nil, s.findErr
	}
	u, ok := s.users[id]
	if !ok {
		return nil, errors.New("not found")
	}
	return u, nil
}

func (s *stubUserRepo) FindByEmail(_ context.Context, email string) (*user.User, error) {
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

func (s *stubUserRepo) Upsert(_ context.Context, u *user.User) error {
	if s.upsertErr != nil {
		return s.upsertErr
	}
	s.users[u.ID] = u
	return nil
}

func (s *stubUserRepo) Delete(_ context.Context, id string) error {
	if s.deleteErr != nil {
		return s.deleteErr
	}
	delete(s.users, id)
	return nil
}

func newHandler(repo user.Repository) *rest.UserHandler {
	return rest.NewUserHandler(usecase.NewService(repo))
}

// --- FindByID ---

func TestFindByIDReturns400WhenPathParamMissing(t *testing.T) {
	h := newHandler(newStubUserRepo())
	r := httptest.NewRequest(http.MethodGet, "/users/", nil)
	w := httptest.NewRecorder()
	h.FindByID(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestFindByIDReturns200WithUser(t *testing.T) {
	repo := newStubUserRepo()
	repo.users["abc"] = &user.User{ID: "abc", Email: "a@b.com", CreatedAt: time.Now()}
	h := newHandler(repo)

	r := httptest.NewRequest(http.MethodGet, "/users/abc", nil)
	r.SetPathValue("userId", "abc")
	w := httptest.NewRecorder()
	h.FindByID(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got user.User
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if got.ID != "abc" {
		t.Errorf("expected user abc, got %s", got.ID)
	}
}

func TestFindByIDReturns404WhenNotFound(t *testing.T) {
	h := newHandler(newStubUserRepo())
	r := httptest.NewRequest(http.MethodGet, "/users/missing", nil)
	r.SetPathValue("userId", "missing")
	w := httptest.NewRecorder()
	h.FindByID(w, r)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}

// --- FindByEmail ---

func TestFindByEmailReturns400WhenQueryParamMissing(t *testing.T) {
	h := newHandler(newStubUserRepo())
	r := httptest.NewRequest(http.MethodGet, "/users", nil)
	w := httptest.NewRecorder()
	h.FindByEmail(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestFindByEmailReturns200WithUser(t *testing.T) {
	repo := newStubUserRepo()
	repo.users["u1"] = &user.User{ID: "u1", Email: "test@example.com", CreatedAt: time.Now()}
	h := newHandler(repo)

	r := httptest.NewRequest(http.MethodGet, "/users?email=test@example.com", nil)
	w := httptest.NewRecorder()
	h.FindByEmail(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	var got user.User
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}
	if got.Email != "test@example.com" {
		t.Errorf("expected test@example.com, got %s", got.Email)
	}
}

func TestFindByEmailReturns404WhenNotFound(t *testing.T) {
	h := newHandler(newStubUserRepo())
	r := httptest.NewRequest(http.MethodGet, "/users?email=nobody@example.com", nil)
	w := httptest.NewRecorder()
	h.FindByEmail(w, r)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected 404, got %d", w.Code)
	}
}

// --- Upsert ---

func TestUpsertReturns400OnInvalidJSON(t *testing.T) {
	h := newHandler(newStubUserRepo())
	r := httptest.NewRequest(http.MethodPut, "/users/x", bytes.NewBufferString("not-json"))
	w := httptest.NewRecorder()
	h.Upsert(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestUpsertReturns400WhenIDOrEmailMissing(t *testing.T) {
	h := newHandler(newStubUserRepo())
	body, _ := json.Marshal(map[string]string{"id": "", "email": ""})
	r := httptest.NewRequest(http.MethodPut, "/users/x", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	h.Upsert(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestUpsertReturns200AndPersistsUser(t *testing.T) {
	repo := newStubUserRepo()
	h := newHandler(repo)
	body, _ := json.Marshal(map[string]string{
		"id": "new-user", "email": "new@example.com", "displayName": "New User",
	})
	r := httptest.NewRequest(http.MethodPut, "/users/new-user", bytes.NewBuffer(body))
	w := httptest.NewRecorder()
	h.Upsert(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	if _, ok := repo.users["new-user"]; !ok {
		t.Error("user should have been persisted")
	}
}

// --- Delete ---

func TestDeleteReturns400WhenPathParamMissing(t *testing.T) {
	h := newHandler(newStubUserRepo())
	r := httptest.NewRequest(http.MethodDelete, "/users/", nil)
	w := httptest.NewRecorder()
	h.Delete(w, r)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
}

func TestDeleteReturns204AndRemovesUser(t *testing.T) {
	repo := newStubUserRepo()
	repo.users["del-me"] = &user.User{ID: "del-me", Email: "del@example.com"}
	h := newHandler(repo)

	r := httptest.NewRequest(http.MethodDelete, "/users/del-me", nil)
	r.SetPathValue("userId", "del-me")
	w := httptest.NewRecorder()
	h.Delete(w, r)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected 204, got %d", w.Code)
	}
	if _, ok := repo.users["del-me"]; ok {
		t.Error("user should have been removed")
	}
}
