package telegram

import (
	"context"

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
	// TODO: implement — detect intent, delegate to parser or eventrequest service
	return "", nil
}

// HandleCallback processes an accept/decline callback from Telegram (UC11).
func (s *Service) HandleCallback(ctx context.Context, userID, requestID string, accept bool) (string, error) {
	// TODO: implement — delegate to eventrequest.Respond
	return "", nil
}
