package textparser

import (
	"context"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
)

// LLMClient abstracts the LLM API call for natural-language text parsing (UC12).
type LLMClient interface {
	// ParseEventText sends free-form text to an LLM and returns structured event data.
	ParseEventText(ctx context.Context, text string) (*ParsedEvent, error)
}

// ParsedEvent is the structured output from the LLM.
type ParsedEvent struct {
	Title      string   `json:"title"`
	Date       string   `json:"date"`       // ISO date
	StartTime  string   `json:"startTime"`  // HH:MM
	EndTime    string   `json:"endTime"`    // HH:MM
	GroupName  string   `json:"groupName"`  // optional
	IncludeIDs []string `json:"includeIds"` // user IDs to include
	ExcludeIDs []string `json:"excludeIds"` // user IDs to exclude
}

// Service handles UC12: Add Event via Text.
type Service struct {
	events domainevent.Repository
	llm    LLMClient
}

// NewService creates a new text-parser service.
func NewService(events domainevent.Repository, llm LLMClient) *Service {
	return &Service{events: events, llm: llm}
}

// ParseAndCreate reads free-form text, calls the LLM, and creates the event (UC12).
func (s *Service) ParseAndCreate(ctx context.Context, userID, rawText string) (*domainevent.Event, error) {
	// TODO: implement — call LLM, convert ParsedEvent → domain Event, persist
	return nil, nil
}
