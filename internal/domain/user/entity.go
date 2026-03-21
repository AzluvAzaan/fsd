package user

import "time"

// User represents an authenticated user in the system.
type User struct {
	ID             string    `json:"id"`
	Email          string    `json:"email"`          // Gmail address
	DisplayName    string    `json:"displayName"`    // Display name from Google profile
	GmailToken     string    `json:"gmailToken"`     // OAuth token for Gmail/Calendar
	TelegramChatID string    `json:"telegramChatId"` // Telegram chat ID for bot
	CreatedAt      time.Time `json:"createdAt"`
}
