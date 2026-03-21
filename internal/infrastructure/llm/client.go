package llm

import (
	"context"

	"github.com/fsd-group/fsd/internal/usecase/textparser"
)

// Client implements textparser.LLMClient.
// It calls an LLM API (e.g., OpenAI, Gemini) to parse free-form text into structured event data.
type Client struct {
	apiKey  string
	baseURL string
	model   string
}

// NewClient creates a new LLM API client.
func NewClient(apiKey, baseURL, model string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseURL: baseURL,
		model:   model,
	}
}

// ParseEventText sends free-form text to the LLM and returns structured event data (UC12).
func (c *Client) ParseEventText(_ context.Context, text string) (*textparser.ParsedEvent, error) {
	// TODO: implement — build prompt, call LLM API, parse JSON response into ParsedEvent
	_ = text
	return nil, nil
}
