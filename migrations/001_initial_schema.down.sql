-- 001_initial_schema.down.sql
-- Drops all tables in reverse dependency order.

BEGIN;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS event_responses CASCADE;
DROP TABLE IF EXISTS event_requests CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS calendars CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;

