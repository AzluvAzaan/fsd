# FSD — Free Slot Detector

A **Group Calendar Coordination System** that lets users authenticate via Google, sync their calendars, form groups, and find shared free time. Supports 12 use cases (UC1–UC12).

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Go 1.25, `pgx/v5` (PostgreSQL), `golang.org/x/oauth2` |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, Zod |
| Database | PostgreSQL (hosted; SSL required by default) |
| Auth | Google OAuth2 |
| Integrations | Google Calendar API, Gmail API, LLM (OpenAI/Gemini), Telegram Bot |

---

## Running Locally

### Backend
```bash
cd backend
cp .env.example .env   # fill in DB creds, Google OAuth, etc.
make run               # go run ./cmd/app  → http://localhost:8080
```

### Frontend
```bash
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
npm install
npm run dev             # http://localhost:3000
```

### Database
```bash
cd backend
make db-migrate   # create all tables
make db-seed      # insert sample data
make db-reset     # drop → migrate → seed
```

---

## Backend Architecture

Clean / Hexagonal Architecture with strict inward dependency rule.

```
cmd/           → entrypoints (app, migrate, pgtest)
internal/
  domain/      → entities + repository interfaces (no external deps)
  usecase/     → business logic (depends only on domain interfaces)
  interface/   → REST handlers + Telegram dispatcher
  infrastructure/ → DB, Google, LLM, config, logger, HTTP router
  bootstrap/   → composition root / dependency injection
  choreographer/ → event-driven cross-service reactions
pkg/           → shared utilities (eventbus, logger interface, middleware, response helpers)
migrations/    → raw SQL files
bruno/         → Bruno HTTP collection for manual API testing
```

### Key Packages

| Package | What it does |
|---|---|
| `internal/domain/` | Entities: User, Group, Calendar, Event, EventRequest, Notification. Repository interfaces only — zero external deps. |
| `internal/usecase/` | UC1 auth/login, UC2 group/manage, UC3-5 calendar/view, UC6 event/create, UC7-8 eventrequest/manage, UC9 notification/notify, UC10 sync/sync_calendar, UC11 telegram/bot, UC12 textparser/parse |
| `internal/interface/rest/` | HTTP handlers — one file per feature |
| `internal/infrastructure/persistence/` | PostgreSQL repo implementations |
| `internal/infrastructure/google/` | Implements GoogleAuthProvider + ExternalCalendarProvider + NotificationSender |
| `internal/infrastructure/llm/` | Implements LLMClient for text→event parsing |
| `internal/choreographer/` | Event-driven layer: subscribes to domain events via `pkg/eventbus` and reacts across services without coupling them |
| `pkg/eventbus/` | In-process pub/sub bus used by choreographer |
| `pkg/middleware/` | RequestLogger, Recoverer, CORS, Auth (reads `X-User-ID` header in dev mode) |
| `pkg/response/` | JSON response helpers: Success, Created, NoContent, Error |

### Implementation Status

| Layer | Done | TODO |
|---|---|---|
| Domain | All entities + all repository interfaces | — |
| Infrastructure | `postgres.go` (connection), `user_postgres.go` (full CRUD), config, logger, router | `group_postgres`, `event_postgres`, `eventrequest_postgres`, `notification_postgres`, Google client, LLM client |
| Use Cases | `user/manage.go` (full), `notification/notify.go` (delegates) | auth, calendar, event, eventrequest, group, sync, telegram, textparser |
| Interface/REST | `user_handler.go` (full) | All other handlers |
| Interface/Telegram | Struct + dispatch skeleton | Telegram API integration |
| Choreographer | Wired + 4 event handlers registered | Handlers are `fmt.Printf` stubs — real reactions TBD |

---

## Frontend Structure

```
src/
  app/
    (app)/app/          # authenticated app routes (dashboard, calendar, groups, etc.)
    (public)/           # unauthenticated pages (landing, login)
    dev/backend-test/   # dev tool to test backend endpoints
  components/
    availability/       # AvailabilityPlanner, SlotList
    calendar/           # CalendarClient, CalendarWorkspace
    groups/             # GroupGrid, GroupsWorkspace
    integrations/       # IntegrationList, IntegrationsWorkspace
    layout/             # AppShell, AppSidebar, AppTopbar, AppRightRail, WorkspaceShell
    notifications/      # NotificationList, NotificationsWorkspace
    providers/          # AppProviders (wraps TanStack Query, themes, etc.)
    requests/           # RequestList, RequestsWorkspace
    settings/           # SettingsWorkspace
    shared/             # EmptyState, Modal, PageHeader, SectionCard, ThemeToggle
    ui/                 # shadcn/ui components
    backend/            # backend dev testing components
  lib/
    api.ts              # backend API helpers
    api/mock.ts         # mock API data
    constants/          # nav.ts, mock-data.ts
    env.ts              # frontend env access
    query-client.ts     # TanStack Query client factory
    utils.ts            # shared utility helpers
```

### Frontend Commands
```bash
npm run dev    # dev server
npm run build  # production build
npm run start  # production server
npm run lint   # ESLint
```

---

## API Routes

| Method | Path | Status |
|---|---|---|
| GET | `/auth/google/login` | TODO |
| GET | `/auth/google/callback` | TODO |
| POST | `/auth/logout` | TODO |
| GET/PUT/DELETE | `/users/{userId}` | **Implemented** |
| GET | `/users?email=` | **Implemented** |
| POST | `/groups` | TODO |
| POST | `/groups/join` | TODO |
| GET | `/groups` | TODO |
| GET | `/groups/{groupId}/members` | TODO |
| GET | `/calendar` | TODO |
| GET | `/groups/{groupId}/calendar` | TODO |
| GET | `/groups/{groupId}/availability` | TODO |
| POST/PUT/DELETE | `/events`, `/events/{eventId}` | TODO |
| POST | `/event-requests` | TODO |
| POST | `/event-requests/{requestId}/respond` | TODO |
| GET | `/event-requests/pending` | TODO |
| GET | `/notifications` | TODO |
| POST | `/notifications/{notificationId}/read` | TODO |
| POST | `/sync/google` | TODO |
| POST | `/events/parse-text` | TODO |

---

## Database

8 tables: `users`, `groups`, `group_members`, `calendars`, `events`, `event_requests`, `event_responses`, `notifications`.

Migration files in `backend/migrations/`. Run via `make db-migrate`.

Auth middleware uses `X-User-ID` header (dev mode) — no real JWT enforcement yet.

---

## Env Variables

### Backend (`.env` in `backend/`)
```
SERVER_PORT=8080
DATABASE_URL=...           # or set DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback
LLM_API_KEY=...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4
TELEGRAM_BOT_TOKEN=...
```

### Frontend (`.env.local` in `frontend/`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## Conventions

- **Go module**: `github.com/fsd-group/fsd`
- **Routing**: Go 1.22+ method-pattern routing (`GET /users/{id}`)
- **JSON responses**: always use `pkg/response` helpers
- **Dependency injection**: all wiring happens in `internal/bootstrap/initialize.go` — do not import infrastructure from domain/usecase
- **Cross-service reactions**: publish events to choreographer; do not call other services directly from a service
- **No ORM** — raw SQL with `database/sql` + pgx driver
- **Frontend data**: currently uses mock data (`lib/api/mock.ts`); real API integration is next
