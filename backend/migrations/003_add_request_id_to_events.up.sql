-- Adds request_id to events (plain TEXT, no FK) and location/note to event_requests.
-- Safe to run on existing databases — all columns use IF NOT EXISTS.
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS request_id TEXT;

ALTER TABLE event_requests
  ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS note     TEXT NOT NULL DEFAULT '';
