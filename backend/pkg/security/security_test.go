package security

import (
	"encoding/hex"
	"strings"
	"testing"
)

func TestGenerateToken_LengthAndFormat(t *testing.T) {
	token, err := GenerateToken(8)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// 8 bytes -> 16 hex chars
	if len(token) != 16 {
		t.Errorf("expected length 16, got %d", len(token))
	}

	// must be valid hex
	if _, err := hex.DecodeString(token); err != nil {
		t.Errorf("token is not valid hex: %v", err)
	}
}

func TestGenerateInviteCode(t *testing.T) {
	code, err := GenerateInviteCode()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// 8 bytes -> 16 hex chars
	if len(code) != 16 {
		t.Errorf("expected invite code length 16, got %d", len(code))
	}

	if strings.Contains(code, " ") {
		t.Errorf("invite code should not contain spaces")
	}
}

func TestGenerateID(t *testing.T) {
	id, err := GenerateID()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// 16 bytes -> 32 hex chars
	if len(id) != 32 {
		t.Errorf("expected id length 32, got %d", len(id))
	}

	if _, err := hex.DecodeString(id); err != nil {
		t.Errorf("id is not valid hex: %v", err)
	}
}
