package textparser

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"

	domaincal "github.com/fsd-group/fsd/internal/domain/calendar"
	domainevent "github.com/fsd-group/fsd/internal/domain/event"
)

const dateTimeLayout = "2006-01-02T15:04"

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
	events    domainevent.Repository
	llm       LLMClient
	calendars domaincal.Repository
}

// NewService creates a new text-parser service.
func NewService(events domainevent.Repository, llm LLMClient, calendars domaincal.Repository) *Service {
	return &Service{events: events, llm: llm, calendars: calendars}
}

func parseDateAndClock(date, clock string) (time.Time, error) {
	if date == "" || clock == "" {
		return time.Time{}, fmt.Errorf("date or time is empty")
	}
	return time.Parse(dateTimeLayout, date+"T"+clock)
}

// ParseAndCreate reads free-form text, calls the LLM, and creates the event (UC12).
func (s *Service) ParseAndCreate(ctx context.Context, userID, rawText string) (*domainevent.Event, error) {
	if userID == "" {
		return nil, fmt.Errorf("user id is required")
	}
	if rawText == "" {
		return nil, fmt.Errorf("text is required")
	}

	parsed, err := s.llm.ParseEventText(ctx, rawText)
	if err != nil {
		return nil, fmt.Errorf("parse event text: %w", err)
	}

	start, err := parseDateAndClock(parsed.Date, parsed.StartTime)
	if err != nil {
		start = time.Now().Add(time.Hour)
	}

	end, err := parseDateAndClock(parsed.Date, parsed.EndTime)
	if err != nil || !end.After(start) {
		end = start.Add(time.Hour)
	}

	cal, err := s.calendars.FindOrCreate(ctx, userID, "Personal", "manual")
	if err != nil {
		return nil, fmt.Errorf("find or create manual calendar: %w", err)
	}

	now := time.Now()
	e := &domainevent.Event{
		ID:         uuid.New().String(),
		CalendarID: cal.ID,
		Title:      parsed.Title,
		Type:       "parsed",
		StartTime:  start,
		EndTime:    end,
		Status:     "confirmed",
		Source:     "llm",
		CreatedAt:  now,
	}

	if err := s.events.Create(ctx, e); err != nil {
		return nil, fmt.Errorf("create event: %w", err)
	}

	return e, nil
}
