-- 001_initial_schema.up.sql
-- Group Calendar Coordination System — full schema

BEGIN;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              TEXT        PRIMARY KEY,
    email           TEXT        UNIQUE NOT NULL,
    display_name    TEXT        NOT NULL DEFAULT '',
    gmail_token     TEXT        NOT NULL DEFAULT '',
    telegram_chat_id TEXT       NOT NULL DEFAULT '',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. groups
-- ============================================================
CREATE TABLE IF NOT EXISTS groups (
    id              TEXT        PRIMARY KEY,
    name            TEXT        NOT NULL,
    invite_code     TEXT        UNIQUE NOT NULL,
    created_by_id   TEXT        NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. group_members  (junction table)
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
    id              TEXT        PRIMARY KEY,
    group_id        TEXT        NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (group_id, user_id)
);

-- ============================================================
-- 4. calendars
-- ============================================================
CREATE TABLE IF NOT EXISTS calendars (
    id              TEXT        PRIMARY KEY,
    user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT        NOT NULL,
    source          TEXT        NOT NULL DEFAULT 'manual',
    is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
    last_synced_at  TIMESTAMPTZ
);

-- ============================================================
-- 5. events
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id              TEXT        PRIMARY KEY,
    calendar_id     TEXT        NOT NULL REFERENCES calendars(id) ON DELETE CASCADE,
    title           TEXT        NOT NULL,
    type            TEXT        NOT NULL DEFAULT '',
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'confirmed',
    source          TEXT        NOT NULL DEFAULT 'manual',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. event_requests
-- ============================================================
CREATE TABLE IF NOT EXISTS event_requests (
    id              TEXT        PRIMARY KEY,
    sender_id       TEXT        NOT NULL REFERENCES users(id),
    group_id        TEXT        NOT NULL REFERENCES groups(id),
    event_id        TEXT        REFERENCES events(id),
    title           TEXT        NOT NULL DEFAULT '',
    type            TEXT        NOT NULL DEFAULT '',
    proposed_start  TIMESTAMPTZ NOT NULL,
    proposed_end    TIMESTAMPTZ NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. event_responses
-- ============================================================
CREATE TABLE IF NOT EXISTS event_responses (
    id              TEXT        PRIMARY KEY,
    request_id      TEXT        NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
    user_id         TEXT        NOT NULL REFERENCES users(id),
    response        TEXT        NOT NULL,
    responded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (request_id, user_id)
);

-- ============================================================
-- 8. notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              TEXT        PRIMARY KEY,
    user_id         TEXT        NOT NULL REFERENCES users(id),
    request_id      TEXT        REFERENCES event_requests(id) ON DELETE SET NULL,
    type            TEXT        NOT NULL DEFAULT '',
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    channel         TEXT        NOT NULL DEFAULT 'in_app'
);

COMMIT;
