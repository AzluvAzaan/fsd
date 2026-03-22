package utils

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// DecodeJSON reads and decodes a JSON request body into dst.
func DecodeJSON(r *http.Request, dst any) error {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20)) // 1 MB max
	if err != nil {
		return fmt.Errorf("reading body: %w", err)
	}
	defer r.Body.Close()
	if err := json.Unmarshal(body, dst); err != nil {
		return fmt.Errorf("decoding JSON: %w", err)
	}
	return nil
}

// ParseTimeRange parses "from" and "to" query parameters in RFC3339 format.
func ParseTimeRange(r *http.Request) (from, to time.Time, err error) {
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	if fromStr == "" || toStr == "" {
		return time.Time{}, time.Time{}, fmt.Errorf("both 'from' and 'to' query parameters are required")
	}

	from, err = time.Parse(time.RFC3339, fromStr)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid 'from' time: %w", err)
	}

	to, err = time.Parse(time.RFC3339, toStr)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid 'to' time: %w", err)
	}

	return from, to, nil
}
