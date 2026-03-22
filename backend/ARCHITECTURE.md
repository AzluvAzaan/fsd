# FSD (Free Slot Detector) — Architecture

## Overview

A **Group Calendar Coordination System** built in Go. Users authenticate via Google, sync their calendars, form groups, and find shared free time. The app supports 12 use cases (UC1–UC12).

The architecture follows **Clean Architecture / Hexagonal Architecture** with 4 layers that enforce a strict dependency rule: **outer layers depend on inner layers, never the reverse**.

```
┌──────────────────────────────────────────────────────┐
│                    cmd/ (entrypoints)                 │
├──────────────────────────────────────────────────────┤
│              interface/ (HTTP + Telegram)             │
├──────────────────────────────────────────────────────┤
│               usecase/ (business logic)              │
├──────────────────────────────────────────────────────┤
│          domain/ (entities + repository interfaces)  │
├──────────────────────────────────────────────────────┤
│     infrastructure/ (DB, Google, LLM, config, etc.)  │
├──────────────────────────────────────────────────────┤
│          pkg/ (shared utilities, no business logic)  │
└──────────────────────────────────────────────────────┘
```

---

## 1. `cmd/` — Entrypoints (3 binaries)

| File | Purpose |
|---|---|
| `cmd/app/main.go` | **Main application.** Loads `.env` → loads config → calls `bootstrap.Initialize()` to wire all dependencies → starts an HTTP server with graceful shutdown (SIGINT/SIGTERM). |
| `cmd/migrate/main.go` | **DB migration CLI.** Accepts `-action` flag (`migrate`, `seed`, `drop`, `reset`). Reads raw `.sql` files from `migrations/` and executes them against PostgreSQL. |
| `cmd/pgtest/main.go` | **DB connectivity smoke test.** Opens a connection, pings, prints the PostgreSQL version, server time, and pool stats. |

---

## 2. `internal/domain/` — Core Entities & Repository Interfaces

The innermost layer. **Zero external dependencies** — only stdlib (`time`). Defines the data structures that map to DB tables and the repository interfaces (contracts) that the persistence layer must implement.

| File | What it defines | Maps to DB table |
|---|---|---|
| `user/entity.go` | `User` struct (id, email, displayName, gmailToken, telegramChatId, createdAt) | `users` |
| `user/repository.go` | `Repository` interface — `FindByID`, `FindByEmail`, `Upsert`, `Delete` | — |
| `group/entity.go` | `Group` struct + `GroupMember` struct | `groups` + `group_members` |
| `group/repository.go` | `Repository` interface — CRUD for groups + membership ops (`AddMember`, `RemoveMember`, `ListMembers`, `IsMember`) | — |
| `calendar/entity.go` | `Calendar` struct + `View` (personal) + `GroupView` (merged busy/free slots) | `calendars` (Calendar only) |
| `event/entity.go` | `Event` struct + `BusySlot` + `FreeSlot` | `events` (Event only) |
| `event/repository.go` | `Repository` interface — CRUD + `ListByUser`, `ListByGroup`, `BusySlots` | — |
| `event/request_entity.go` | `EventRequest` struct + `EventResponse` struct | `event_requests` + `event_responses` |
| `event/request_repository.go` | `RequestRepository` interface — `CreateRequest`, `FindRequestByID`, `ListPendingByRecipient`, `Respond`, `ListResponses` | — |
| `notification/entity.go` | `Notification` struct (nullable `*string` RequestID) | `notifications` |
| `notification/repository.go` | `Repository` interface — `Create`, `ListByRecipient`, `MarkRead` | — |

---

## 3. `internal/usecase/` — Business Logic

Each package contains a `Service` struct that orchestrates domain entities and repository interfaces. Use cases depend **only on domain interfaces**, never on concrete infrastructure.

| Package | Use Case | What it does |
|---|---|---|
| `auth/login.go` | **UC1: Login via Gmail** | Defines `GoogleAuthProvider` interface. `LoginWithGoogle()` exchanges OAuth code → upserts user → returns session. |
| `user/manage.go` | User management | Thin pass-through: `FindByID`, `FindByEmail`, `Upsert`, `Delete` delegated to `user.Repository`. |
| `group/manage.go` | **UC2: Create Group & Invite** | `CreateGroup()` generates invite link. `JoinByInvite()` resolves code → adds member. `ListUserGroups`, `ListMembers`. |
| `calendar/view.go` | **UC3/UC4/UC5: Calendar Views** | `PersonalView()` — consolidated personal calendar. `GroupCalendarView()` — overlaid busy slots. `CheckAvailability()` — free slot computation. |
| `event/create.go` | **UC6: Add Manual Event** | `CreateManual()` creates an event with `source=manual`. Also `Update()` and `Delete()`. |
| `eventrequest/manage.go` | **UC7/UC8: Event Requests** | `SendRequest()` creates a pending request + notifies. `Respond()` records accept/reject. `ListPending()` for inbox. Also defines `NotificationSender` interface (satisfied by Google client). |
| `notification/notify.go` | **UC9: Notifications** | `List()` returns notifications for a user. `MarkRead()` marks one as read. |
| `sync/sync_calendar.go` | **UC10: Sync External Calendars** | Defines `ExternalCalendarProvider` interface. `SyncGoogle()` pulls events from Google Calendar and upserts locally. |
| `telegram/bot.go` | **UC11: Telegram Bot** | `HandleMessage()` detects intent from free text → delegates to text parser or event request service. `HandleCallback()` handles inline accept/decline buttons. |
| `textparser/parse.go` | **UC12: Add Event via Text** | Defines `LLMClient` interface + `ParsedEvent` struct. `ParseAndCreate()` sends text to LLM → converts response → persists event. |

---

## 4. `internal/infrastructure/` — External Integrations

Implements the interfaces defined in `domain/` and `usecase/`. This is the only layer that touches the outside world.

| Package | File(s) | Purpose |
|---|---|---|
| `config/` | `config.go` | Reads all env vars (`SERVER_PORT`, `DATABASE_URL`, Google OAuth creds, LLM config, Telegram token) into a `Config` struct. |
| `persistence/` | `postgres.go` | Opens `database/sql` connection via `pgx/v5` driver, configures pool (25 max open, 5 idle), pings, and runs inline schema migration. |
| | `user_postgres.go` | **Fully implemented** — `FindByID`, `FindByEmail`, `Upsert`, `Delete` with raw SQL. |
| | `group_postgres.go` | Stub — all methods `panic("not implemented")`. |
| | `event_postgres.go` | Stub — all methods `panic("not implemented")`. |
| | `eventrequest_postgres.go` | Stub — all methods `panic("not implemented")`. |
| | `notification_postgres.go` | Stub — all methods `panic("not implemented")`. |
| `google/` | `client.go` | Implements 3 interfaces: `auth.GoogleAuthProvider` (OAuth), `sync.ExternalCalendarProvider` (Calendar API), `eventrequest.NotificationSender` (Gmail API). All TODOs. |
| `llm/` | `client.go` | Implements `textparser.LLMClient`. Calls OpenAI/Gemini to parse free-form text into structured `ParsedEvent`. TODO. |
| `logger/` | `logger.go` | Simple logger with `[INFO]`, `[WARN]`, `[ERROR]` prefixes using stdlib `log`. |
| `http/` | `router.go` | Builds `http.ServeMux` with all routes, applies global middleware (CORS → RequestLogger → Recoverer). Uses Go 1.22+ method-pattern routing. |

---

## 5. `internal/interface/` — Delivery / Transport Layer

Translates HTTP requests and Telegram messages into use case calls.

| Package | File(s) | Routes |
|---|---|---|
| `rest/` | `auth_handler.go` | `GET /auth/google/login`, `GET /auth/google/callback`, `POST /auth/logout` |
| | `user_handler.go` | **Fully implemented** — `GET /users/{userId}`, `GET /users?email=`, `PUT /users`, `DELETE /users/{userId}` |
| | `group_handler.go` | `POST /groups`, `POST /groups/join`, `GET /groups`, `GET /groups/{groupId}/members` |
| | `calendar_handler.go` | `GET /calendar`, `GET /groups/{groupId}/calendar`, `GET /groups/{groupId}/availability` |
| | `event_handler.go` | `POST /events`, `PUT /events/{eventId}`, `DELETE /events/{eventId}` |
| | `eventrequest_handler.go` | `POST /event-requests`, `POST /event-requests/{requestId}/respond`, `GET /event-requests/pending` |
| | `notification_handler.go` | `GET /notifications`, `POST /notifications/{notificationId}/read` |
| | `sync_handler.go` | `POST /sync/google` |
| | `textparser_handler.go` | `POST /events/parse-text` |
| `telegram/` | `bot_handler.go` | Dispatches Telegram messages/callbacks to the telegram usecase service. |

---

## 6. `internal/bootstrap/initialize.go` — Dependency Injection

The **composition root**. Called once at startup. Instantiates everything in order:

```
Config → Logger → Google Client → LLM Client → PostgreSQL DB
  → Repositories → Use Case Services → REST Handlers → Telegram Bot → Router
```

Returns an `App` struct containing `Config`, `Logger`, `HTTPHandler`, and `TelegramBot`.

---

## 7. `pkg/` — Shared Utilities

Importable by any layer. Contains no business logic.

| Package | File | Purpose |
|---|---|---|
| `logger/` | `logger.go` | `Logger` **interface** (Info, Warn, Error). Concrete impl lives in `internal/infrastructure/logger`. |
| `middleware/` | `auth.go` | `Auth()` middleware — reads `X-User-ID` header (dev mode). `UserIDFromContext()` to extract it. |
| | `middleware.go` | `RequestLogger` (logs method + path + duration), `Recoverer` (catches panics → 500), `CORS` (permissive dev headers). |
| `response/` | `response.go` | JSON response helpers: `Success` (200), `Created` (201), `NoContent` (204), `Error` (custom status). |
| `security/` | `token.go` | JWT/token utilities. |
| `utils/` | `env.go` | `LoadEnvFile()` — hand-rolled `.env` parser (doesn't override existing vars). |
| | `http.go` | `DecodeJSON()` — reads + unmarshals body (1MB limit). `ParseTimeRange()` — parses `from`/`to` query params as RFC3339. |

---

## 8. `migrations/` — SQL Files

| File | Purpose |
|---|---|
| `001_initial_schema.up.sql` | Creates all 8 tables with FKs, constraints, and defaults. |
| `001_initial_schema.down.sql` | Drops all tables in reverse dependency order. |
| `002_seed_data.sql` | Inserts sample users, groups, members, calendars, events, requests, responses, and notifications. |

---

## 9. `bruno/` — API Testing Collection

[Bruno](https://www.usebruno.com/) HTTP client collection for manual API testing.

| File | Purpose |
|---|---|
| `bruno.json` | Collection metadata. |
| `environments/local.bru` | Local environment variables (base URL, etc.). |
| `users/*.bru` | Pre-built requests: `upsert-user`, `find-user-by-id`, `find-user-by-email`, `delete-user`. |

---

## 10. Root Files

| File | Purpose |
|---|---|
| `go.mod` / `go.sum` | Go module definition. Single direct dependency: `pgx/v5` (PostgreSQL driver). |
| `Makefile` | Dev commands: `build`, `run`, `test`, `fmt`, `lint`, `tidy`, `db-migrate`, `db-drop`, `db-seed`, `db-reset`. |

---

## Implementation Status

| Layer | Implemented | TODO |
|---|---|---|
| **Domain** | All entities + all repository interfaces | — |
| **Infrastructure** | `postgres.go` (connection + migration), `user_postgres.go` (full CRUD), config, logger, router | `group_postgres`, `event_postgres`, `eventrequest_postgres`, `notification_postgres`, Google client, LLM client |
| **Use Cases** | `user/manage.go` (full), `notification/notify.go` (delegates) | All core business logic in auth, calendar, event, eventrequest, group, sync, telegram, textparser |
| **Interface/REST** | `user_handler.go` (full) | All other handlers |
| **Interface/Telegram** | Struct + dispatch skeleton | Actual Telegram API integration |

The project has a **complete skeleton** with all routing, wiring, and contracts in place. The User CRUD vertical slice (domain → repo → persistence → usecase → handler) is fully working end-to-end. Everything else has the structure defined but method bodies are TODO stubs.

