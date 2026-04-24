package response

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestJSON(t *testing.T) {
	w := httptest.NewRecorder()

	payload := map[string]string{
		"message": "hello",
	}

	JSON(w, http.StatusOK, payload)

	resp := w.Result()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	if ct := resp.Header.Get("Content-Type"); ct != "application/json" {
		t.Errorf("expected application/json, got %s", ct)
	}

	var decoded map[string]string
	if err := json.NewDecoder(resp.Body).Decode(&decoded); err != nil {
		t.Fatalf("failed to decode json: %v", err)
	}

	if decoded["message"] != "hello" {
		t.Errorf("expected message=hello, got %v", decoded["message"])
	}
}

func TestError(t *testing.T) {
	w := httptest.NewRecorder()

	Error(w, http.StatusBadRequest, "something went wrong")

	resp := w.Result()

	var decoded map[string]string
	_ = json.NewDecoder(resp.Body).Decode(&decoded)

	if decoded["error"] != "something went wrong" {
		t.Errorf("unexpected error message: %v", decoded["error"])
	}

	if resp.StatusCode != http.StatusBadRequest {
		t.Errorf("expected 400, got %d", resp.StatusCode)
	}
}

func TestSuccess(t *testing.T) {
	w := httptest.NewRecorder()

	data := map[string]string{"ok": "true"}

	Success(w, data)

	resp := w.Result()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected 200, got %d", resp.StatusCode)
	}

	var decoded map[string]string
	_ = json.NewDecoder(resp.Body).Decode(&decoded)

	if decoded["ok"] != "true" {
		t.Errorf("unexpected response body")
	}
}

func TestCreated(t *testing.T) {
	w := httptest.NewRecorder()

	data := map[string]string{"id": "123"}

	Created(w, data)

	resp := w.Result()

	if resp.StatusCode != http.StatusCreated {
		t.Errorf("expected 201, got %d", resp.StatusCode)
	}

	var decoded map[string]string
	_ = json.NewDecoder(resp.Body).Decode(&decoded)

	if decoded["id"] != "123" {
		t.Errorf("unexpected response body")
	}
}

func TestNoContent(t *testing.T) {
	w := httptest.NewRecorder()

	NoContent(w)

	resp := w.Result()
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusNoContent {
		t.Errorf("expected 204, got %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("failed to read body: %v", err)
	}

	if len(body) != 0 {
		t.Errorf("expected empty body, got %q", string(body))
	}
}
