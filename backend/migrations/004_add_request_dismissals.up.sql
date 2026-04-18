-- Per-user soft-dismissal for event requests.
-- When a user "clears" a request from their inbox it records a row here.
-- The list queries exclude dismissed rows for the requesting user so each
-- user's view is independent — clearing never affects the other party.
CREATE TABLE IF NOT EXISTS event_request_dismissals (
    user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id TEXT        NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
    dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, request_id)
);
