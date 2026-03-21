package telegram

import (
	"context"
	"log"

	usetelegram "github.com/fsd-group/fsd/internal/usecase/telegram"
)

// BotHandler handles incoming Telegram updates for UC11.
type BotHandler struct {
	botService *usetelegram.Service
}

// NewBotHandler creates a new Telegram bot handler.
func NewBotHandler(botService *usetelegram.Service) *BotHandler {
	return &BotHandler{botService: botService}
}

// HandleUpdate processes an incoming Telegram update (message or callback).
// This would be called from a webhook endpoint or long-polling loop.
func (h *BotHandler) HandleUpdate(ctx context.Context, update Update) {
	if update.Message != "" {
		reply, err := h.botService.HandleMessage(ctx, update.UserID, update.Message)
		if err != nil {
			log.Printf("telegram bot error: %v", err)
			return
		}
		// TODO: send reply back to Telegram chat
		_ = reply
	}

	if update.CallbackData != "" {
		// TODO: parse callback data into requestID + accept/decline
		// reply, err := h.botService.HandleCallback(ctx, update.UserID, requestID, accept)
	}
}

// Update is a simplified Telegram update structure.
// Replace with the actual Telegram Bot API types when integrating.
type Update struct {
	UserID       string // Mapped from Telegram user ID to our internal user ID
	ChatID       int64
	Message      string
	CallbackData string
}
