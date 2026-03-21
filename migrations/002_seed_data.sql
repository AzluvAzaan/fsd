-- 002_seed_data.sql
-- Sample data for the Group Calendar Coordination System.
-- Run AFTER 001_initial_schema.up.sql

BEGIN;

-- ============================================================
-- Users
-- ============================================================
INSERT INTO users (id, email, display_name, gmail_token, telegram_chat_id)
VALUES
    ('usr-001', 'alice@gmail.com',   'Alice Johnson',  'gtoken-alice',  '100001'),
    ('usr-002', 'bob@gmail.com',     'Bob Smith',      'gtoken-bob',    '100002'),
    ('usr-003', 'charlie@gmail.com', 'Charlie Brown',  '',              ''),
    ('usr-004', 'diana@gmail.com',   'Diana Prince',   'gtoken-diana',  '100004'),
    ('usr-005', 'eve@gmail.com',     'Eve Adams',      'gtoken-eve',    '100005')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Groups
-- ============================================================
INSERT INTO groups (id, name, invite_link, created_by_id)
VALUES
    ('grp-001', 'Project Alpha Team',  'https://fsd.app/join/alpha-2026',  'usr-001'),
    ('grp-002', 'Study Group',         'https://fsd.app/join/study-2026',  'usr-002'),
    ('grp-003', 'Weekend Planners',    'https://fsd.app/join/wknd-2026',   'usr-004')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Group Members
-- ============================================================
INSERT INTO group_members (id, group_id, user_id)
VALUES
    ('gm-001', 'grp-001', 'usr-001'),
    ('gm-002', 'grp-001', 'usr-002'),
    ('gm-003', 'grp-001', 'usr-003'),
    ('gm-004', 'grp-002', 'usr-002'),
    ('gm-005', 'grp-002', 'usr-004'),
    ('gm-006', 'grp-002', 'usr-005'),
    ('gm-007', 'grp-003', 'usr-004'),
    ('gm-008', 'grp-003', 'usr-001'),
    ('gm-009', 'grp-003', 'usr-005')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Calendars
-- ============================================================
INSERT INTO calendars (id, user_id, name, source, is_default, last_synced_at)
VALUES
    ('cal-001', 'usr-001', 'Alice Personal',  'google',  TRUE,  '2026-03-21 08:00:00+00'),
    ('cal-002', 'usr-001', 'Alice Work',      'google',  FALSE, '2026-03-21 08:00:00+00'),
    ('cal-003', 'usr-002', 'Bob Calendar',    'google',  TRUE,  '2026-03-21 07:30:00+00'),
    ('cal-004', 'usr-003', 'Charlie Apple',   'apple',   TRUE,  '2026-03-20 12:00:00+00'),
    ('cal-005', 'usr-004', 'Diana Default',   'manual',  TRUE,  NULL),
    ('cal-006', 'usr-005', 'Eve Google',      'google',  TRUE,  '2026-03-21 06:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Events
-- ============================================================
INSERT INTO events (id, calendar_id, title, type, start_time, end_time, status, source)
VALUES
    ('evt-001', 'cal-001', 'Team Standup',       'meeting',  '2026-03-22 09:00:00+00', '2026-03-22 09:30:00+00', 'confirmed', 'google'),
    ('evt-002', 'cal-001', 'Lunch with Bob',     'personal', '2026-03-22 12:00:00+00', '2026-03-22 13:00:00+00', 'confirmed', 'manual'),
    ('evt-003', 'cal-002', 'Sprint Planning',    'meeting',  '2026-03-23 10:00:00+00', '2026-03-23 11:30:00+00', 'confirmed', 'google'),
    ('evt-004', 'cal-003', 'Study Session',      'meeting',  '2026-03-22 14:00:00+00', '2026-03-22 16:00:00+00', 'confirmed', 'manual'),
    ('evt-005', 'cal-004', 'Dentist Appointment','personal', '2026-03-24 11:00:00+00', '2026-03-24 12:00:00+00', 'confirmed', 'apple'),
    ('evt-006', 'cal-005', 'Yoga Class',         'personal', '2026-03-22 07:00:00+00', '2026-03-22 08:00:00+00', 'confirmed', 'manual'),
    ('evt-007', 'cal-006', 'Project Review',     'meeting',  '2026-03-23 15:00:00+00', '2026-03-23 16:00:00+00', 'pending',   'google'),
    ('evt-008', 'cal-003', 'Weekend Hike',       'personal', '2026-03-28 08:00:00+00', '2026-03-28 14:00:00+00', 'pending',   'telegram')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Event Requests
-- ============================================================
INSERT INTO event_requests (id, sender_id, group_id, event_id, title, type, proposed_start, proposed_end, status)
VALUES
    ('req-001', 'usr-001', 'grp-001', 'evt-003', 'Sprint Planning',  'meeting',  '2026-03-23 10:00:00+00', '2026-03-23 11:30:00+00', 'pending'),
    ('req-002', 'usr-002', 'grp-002', 'evt-004', 'Study Session',    'meeting',  '2026-03-22 14:00:00+00', '2026-03-22 16:00:00+00', 'accepted'),
    ('req-003', 'usr-004', 'grp-003', 'evt-008', 'Weekend Hike',     'personal', '2026-03-28 08:00:00+00', '2026-03-28 14:00:00+00', 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Event Responses
-- ============================================================
INSERT INTO event_responses (id, request_id, user_id, response)
VALUES
    ('resp-001', 'req-001', 'usr-002', 'accepted'),
    ('resp-002', 'req-001', 'usr-003', 'rejected'),
    ('resp-003', 'req-002', 'usr-004', 'accepted'),
    ('resp-004', 'req-002', 'usr-005', 'accepted'),
    ('resp-005', 'req-003', 'usr-001', 'accepted'),
    ('resp-006', 'req-003', 'usr-005', 'pending')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Notifications
-- ============================================================
INSERT INTO notifications (id, user_id, request_id, type, sent_at, channel)
VALUES
    ('ntf-001', 'usr-002', 'req-001', 'event_invite',   '2026-03-21 10:00:00+00', 'email'),
    ('ntf-002', 'usr-003', 'req-001', 'event_invite',   '2026-03-21 10:00:00+00', 'email'),
    ('ntf-003', 'usr-004', 'req-002', 'event_invite',   '2026-03-21 09:00:00+00', 'in_app'),
    ('ntf-004', 'usr-005', 'req-002', 'event_invite',   '2026-03-21 09:00:00+00', 'email'),
    ('ntf-005', 'usr-001', 'req-001', 'response_update','2026-03-21 11:00:00+00', 'in_app'),
    ('ntf-006', 'usr-001', 'req-003', 'event_invite',   '2026-03-21 12:00:00+00', 'email'),
    ('ntf-007', 'usr-005', 'req-003', 'event_invite',   '2026-03-21 12:00:00+00', 'in_app')
ON CONFLICT (id) DO NOTHING;

COMMIT;

