package rest

import (
	"encoding/json"
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/textparser"
	"github.com/fsd-group/fsd/pkg/middleware"
	"github.com/fsd-group/fsd/pkg/response"
)

// TextParserHandler handles HTTP requests for UC12: Add Event via Text.
type TextParserHandler struct {
	parserService *textparser.Service
}

// NewTextParserHandler creates a new text parser handler.
func NewTextParserHandler(parserService *textparser.Service) *TextParserHandler {
	return &TextParserHandler{parserService: parserService}
}

type parseTextRequest struct {
	Text string `json:"text"`
}

// ParseText accepts pasted text, calls the LLM, and creates an event.
// POST /events/parse-text
func (h *TextParserHandler) ParseText(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		response.Error(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	var req parseTextRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if req.Text == "" {
		response.Error(w, http.StatusBadRequest, "text is required")
		return
	}

	created, err := h.parserService.ParseAndCreate(r.Context(), userID, req.Text)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.Created(w, created)
}
