package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fsd-group/fsd/pkg/middleware"
)

func TestAuthRejects401WhenNoUserIDHeader(t *testing.T) {
	handler := middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler(w, r)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthCallsNextAndInjectsUserIDWhenHeaderPresent(t *testing.T) {
	var capturedID string
	handler := middleware.Auth(func(w http.ResponseWriter, r *http.Request) {
		capturedID, _ = middleware.UserIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	})

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	r.Header.Set("X-User-ID", "user-abc")
	w := httptest.NewRecorder()
	handler(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	if capturedID != "user-abc" {
		t.Errorf("expected user-abc in context, got %q", capturedID)
	}
}

func TestUserIDFromContextReturnsFalseWhenNotSet(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	_, ok := middleware.UserIDFromContext(r.Context())
	if ok {
		t.Error("expected false when context has no user ID")
	}
}

func TestCORSSetsAllowOriginStar(t *testing.T) {
	handler := middleware.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)

	if got := w.Header().Get("Access-Control-Allow-Origin"); got != "*" {
		t.Errorf("expected *, got %q", got)
	}
}

func TestCORSHandlesOptionsWith204AndNoBody(t *testing.T) {
	reached := false
	handler := middleware.CORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reached = true
	}))

	r := httptest.NewRequest(http.MethodOptions, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected 204 for OPTIONS preflight, got %d", w.Code)
	}
	if reached {
		t.Error("next handler must not be called for OPTIONS preflight")
	}
}

func TestRecovererReturns500OnPanic(t *testing.T) {
	handler := middleware.Recoverer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		panic("something exploded")
	}))

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected 500 after panic, got %d", w.Code)
	}
}

func TestRecovererPassesThroughNormalRequests(t *testing.T) {
	handler := middleware.Recoverer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
