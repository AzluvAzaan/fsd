package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	usetelegram "github.com/fsd-group/fsd/internal/usecase/telegram"
)

// BotHandler handles incoming Telegram updates for UC11.
type BotHandler struct {
	botService *usetelegram.Service
	botToken   string
}

// NewBotHandler creates a new Telegram bot handler.
func NewBotHandler(botService *usetelegram.Service, botToken string) *BotHandler {
	return &BotHandler{botService: botService, botToken: botToken}
}

// HandleUpdate processes an incoming Telegram update (message or callback).
// This would be called from a webhook endpoint or long-polling loop.
func (h *BotHandler) HandleUpdate(ctx context.Context, update Update) {
	if update.Message != "" {
		reply, err := h.botService.HandleMessage(ctx, update.UserID, update.Message)
		if err != nil {
			reply = "Sorry, something went wrong."
		}
		_ = sendTelegramMessage(update.ChatID, reply, h.botToken)
		return
	}

	if update.CallbackData != "" {
		requestID, accept, ok := parseCallbackData(update.CallbackData)
		if !ok {
			_ = sendTelegramMessage(update.ChatID, "Invalid action.", h.botToken)
			return
		}
		reply, err := h.botService.HandleCallback(ctx, update.UserID, requestID, accept)
		if err != nil {
			reply = "Sorry, something went wrong."
		}
		_ = sendTelegramMessage(update.ChatID, reply, h.botToken)
	}
}

func parseCallbackData(data string) (requestID string, accept bool, ok bool) {
	parts := strings.SplitN(data, ":", 2)
	if len(parts) != 2 {
		return "", false, false
	}
	switch parts[1] {
	case "accept":
		return parts[0], true, true
	case "reject":
		return parts[0], false, true
	default:
		return "", false, false
	}
}

func sendTelegramMessage(chatID int64, text, botToken string) error {
	if botToken == "" {
		return fmt.Errorf("telegram bot token is not configured")
	}
	payload, err := json.Marshal(map[string]any{
		"chat_id": chatID,
		"text":    text,
	})
	if err != nil {
		return fmt.Errorf("marshal sendMessage body: %w", err)
	}
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)
	resp, err := http.Post(url, "application/json", bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("telegram sendMessage request: %w", err)
	}
	defer resp.Body.Close()
	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("telegram sendMessage: status %d: %s", resp.StatusCode, string(respBytes))
	}
	return nil
}

// rawTelegramUpdate matches the Telegram webhook JSON shape we support.
type rawTelegramUpdate struct {
	UpdateID int64 `json:"update_id"`
	Message  *struct {
		From struct {
			ID int64 `json:"id"`
		} `json:"from"`
		Chat struct {
			ID int64 `json:"id"`
		} `json:"chat"`
		Text string `json:"text"`
	} `json:"message"`
	CallbackQuery *struct {
		From struct {
			ID int64 `json:"id"`
		} `json:"from"`
		Message *struct {
			Chat struct {
				ID int64 `json:"id"`
			} `json:"chat"`
		} `json:"message"`
		Data string `json:"data"`
	} `json:"callback_query"`
}

// ServeWebhook decodes a Telegram update and dispatches to HandleUpdate.
func (h *BotHandler) ServeWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var raw rawTelegramUpdate
	if err := json.NewDecoder(r.Body).Decode(&raw); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	var u Update
	if raw.Message != nil {
		u.UserID = fmt.Sprintf("%d", raw.Message.From.ID)
		u.ChatID = raw.Message.Chat.ID
		u.Message = raw.Message.Text
	} else if raw.CallbackQuery != nil {
		u.UserID = fmt.Sprintf("%d", raw.CallbackQuery.From.ID)
		u.CallbackData = raw.CallbackQuery.Data
		if raw.CallbackQuery.Message != nil {
			u.ChatID = raw.CallbackQuery.Message.Chat.ID
		} else {
			u.ChatID = raw.CallbackQuery.From.ID
		}
	}

	h.HandleUpdate(r.Context(), u)
	w.WriteHeader(http.StatusOK)
}

// Update is a simplified Telegram update structure.
// Replace with the actual Telegram Bot API types when integrating.
type Update struct {
	UserID       string // Mapped from Telegram user ID to our internal user ID
	ChatID       int64
	Message      string
	CallbackData string
}
