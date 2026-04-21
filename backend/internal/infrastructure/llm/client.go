package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/fsd-group/fsd/internal/usecase/textparser"
)

const systemPrompt = `You are a calendar assistant. Extract event details from the user's text and return ONLY a valid JSON object with these fields: title (string), date (ISO date string YYYY-MM-DD), startTime (HH:MM 24hr), endTime (HH:MM 24hr, estimate 1hr after start if not mentioned), groupName (string, empty if not mentioned), includeIds (empty array), excludeIds (empty array). Return ONLY the JSON object, no markdown, no explanation.`

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

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens"`
	Temperature float64       `json:"temperature"`
}

type chatCompletionResponse struct {
	Choices []struct {
		Message struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"message"`
	} `json:"choices"`
}

func cleanJSONContent(s string) string {
	s = strings.TrimSpace(s)
	if strings.HasPrefix(s, "```json") {
		s = strings.TrimPrefix(s, "```json")
	} else if strings.HasPrefix(s, "```") {
		s = strings.TrimPrefix(s, "```")
	}
	s = strings.TrimSpace(s)
	s = strings.TrimSuffix(s, "```")
	return strings.TrimSpace(s)
}

// ParseEventText sends free-form text to the LLM and returns structured event data (UC12).
func (c *Client) ParseEventText(ctx context.Context, text string) (*textparser.ParsedEvent, error) {
	reqBody := chatCompletionRequest{
		Model: c.model,
		Messages: []chatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: text},
		},
		MaxTokens:   300,
		Temperature: 0,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("marshal chat completion request: %w", err)
	}

	base := strings.TrimSuffix(c.baseURL, "/")
	url := base + "/chat/completions"

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("create http request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute chat completion request: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read chat completion response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("chat completion api: status %d: %s", resp.StatusCode, string(respBytes))
	}

	var apiResp chatCompletionResponse
	if err := json.Unmarshal(respBytes, &apiResp); err != nil {
		return nil, fmt.Errorf("unmarshal chat completion response: %w", err)
	}

	if len(apiResp.Choices) == 0 {
		return nil, fmt.Errorf("chat completion response: no choices returned")
	}

	content := apiResp.Choices[0].Message.Content
	if strings.TrimSpace(content) == "" {
		return nil, fmt.Errorf("chat completion response: empty message content")
	}

	cleaned := cleanJSONContent(content)

	var parsed textparser.ParsedEvent
	if err := json.Unmarshal([]byte(cleaned), &parsed); err != nil {
		return nil, fmt.Errorf("unmarshal parsed event json: %w", err)
	}

	return &parsed, nil
}
