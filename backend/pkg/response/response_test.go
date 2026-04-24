package response_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fsd-group/fsd/pkg/response"
)

func TestSuccessWrites200WithJSONBody(t *testing.T) {
	w := httptest.NewRecorder()
	response.Success(w, map[string]string{"key": "value"})

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
	if ct := w.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %s", ct)
	}
	var got map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("response body is not valid JSON: %v", err)
	}
	if got["key"] != "value" {
		t.Errorf("unexpected body: %v", got)
	}
}

func TestCreatedWrites201WithJSONBody(t *testing.T) {
	w := httptest.NewRecorder()
	response.Created(w, map[string]string{"id": "123"})

	if w.Code != http.StatusCreated {
		t.Errorf("expected 201, got %d", w.Code)
	}
	var got map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("response body is not valid JSON: %v", err)
	}
	if got["id"] != "123" {
		t.Errorf("unexpected body: %v", got)
	}
}

func TestNoContentWrites204WithEmptyBody(t *testing.T) {
	w := httptest.NewRecorder()
	response.NoContent(w)

	if w.Code != http.StatusNoContent {
		t.Errorf("expected 204, got %d", w.Code)
	}
	if w.Body.Len() != 0 {
		t.Errorf("expected empty body, got: %s", w.Body.String())
	}
}

func TestErrorWritesStatusWithErrorMessage(t *testing.T) {
	w := httptest.NewRecorder()
	response.Error(w, http.StatusBadRequest, "missing field")

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", w.Code)
	}
	var got map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatalf("response body is not valid JSON: %v", err)
	}
	if got["error"] != "missing field" {
		t.Errorf("expected error 'missing field', got %v", got)
	}
}

func TestErrorSetsContentTypeJSON(t *testing.T) {
	w := httptest.NewRecorder()
	response.Error(w, http.StatusInternalServerError, "boom")

	if ct := w.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %s", ct)
	}
}
