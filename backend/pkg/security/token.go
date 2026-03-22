package security

import (
	"crypto/rand"
	"encoding/hex"
)

// GenerateToken generates a cryptographically secure random hex token.
// Used for invite codes, session tokens, etc.
func GenerateToken(byteLength int) (string, error) {
	b := make([]byte, byteLength)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// GenerateInviteCode generates a short invite code for groups (UC2).
func GenerateInviteCode() (string, error) {
	return GenerateToken(8) // 16-char hex string
}

// GenerateID generates a unique ID for domain entities.
func GenerateID() (string, error) {
	return GenerateToken(16) // 32-char hex string
}
