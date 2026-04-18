package telegram

import (
	"context"
	"fmt"
	"strings"

	domainevent "github.com/fsd-group/fsd/internal/domain/event"
	"github.com/fsd-group/fsd/internal/usecase/eventrequest"
	"github.com/fsd-group/fsd/internal/usecase/textparser"
)

// Service handles UC11: Manage Calendar via Telegram Bot.
type Service struct {
	events    domainevent.Repository
	parser    *textparser.Service
	eventReqs *eventrequest.Service
}

// NewService creates a new Telegram bot use-case service.
func NewService(
	events domainevent.Repository,
	parser *textparser.Service,
	eventReqs *eventrequest.Service,
) *Service {
	return &Service{events: events, parser: parser, eventReqs: eventReqs}
}

// HandleMessage processes a free-text message from Telegram (UC11).
// Examples:
//   - "dinner with mum at 7pm tmr"   → creates event
//   - "any pending requests"          → lists pending, prompts accept/decline
func (s *Service) HandleMessage(ctx context.Context, userID, message string) (string, error) {
	lower := strings.ToLower(message)
	if strings.Contains(lower, "pending") || strings.Contains(lower, "requests") || strings.Contains(lower, "invite") {
		list, err := s.eventReqs.ListPending(ctx, userID)
		if err != nil {
			return "", fmt.Errorf("list pending: %w", err)
		}
		if len(list) == 0 {
			return "You have no pending requests.", nil
		}
		var b strings.Builder
		fmt.Fprintf(&b, "You have %d pending request(s):\n", len(list))
		for i, req := range list {
			fmt.Fprintf(&b, "%d. %s from %s\n", i+1, req.Title, req.SenderID)
		}
		return strings.TrimSuffix(b.String(), "\n"), nil
	}

	ev, err := s.parser.ParseAndCreate(ctx, userID, message)
	if err != nil {
		return "Sorry I could not understand that. Try: 'dinner with team at 7pm tomorrow'", nil
	}
	return fmt.Sprintf("Got it! I have added '%s' to your calendar.", ev.Title), nil
}

// HandleCallback processes an accept/decline callback from Telegram (UC11).
func (s *Service) HandleCallback(ctx context.Context, userID, requestID string, accept bool) (string, error) {
	decision := "rejected"
	if accept {
		decision = "accepted"
	}
	_, err := s.eventReqs.Respond(ctx, eventrequest.RespondInput{
		RequestID:   requestID,
		RecipientID: userID,
		Decision:    decision,
	})
	if err != nil {
		return "Sorry something went wrong.", nil
	}
	if accept {
		return "You have accepted the request.", nil
	}
	return "You have declined the request.", nil
}
