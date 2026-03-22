package rest

import (
	"net/http"

	"github.com/fsd-group/fsd/internal/usecase/textparser"
)

// TextParserHandler handles HTTP requests for UC12: Add Event via Text.
type TextParserHandler struct {
	parserService *textparser.Service
}

// NewTextParserHandler creates a new text parser handler.
func NewTextParserHandler(parserService *textparser.Service) *TextParserHandler {
	return &TextParserHandler{parserService: parserService}
}

// ParseText accepts pasted text, calls the LLM, and creates an event.
// POST /events/parse-text
func (h *TextParserHandler) ParseText(w http.ResponseWriter, r *http.Request) {
	// TODO: parse body (rawText), extract userID, call parserService.ParseAndCreate
}
