# FSD — Free Slot Detector

A group calendar coordination system. Users authenticate via Google, sync their calendars, form groups, and find shared free time.

## Stack

| Layer | Tech |
|---|---|
| Backend | Go 1.25, `pgx/v5` (PostgreSQL), `golang.org/x/oauth2` |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query |
| Database | PostgreSQL (hosted; SSL required) |
| Auth | Google OAuth2 |
| Integrations | Google Calendar API, Gmail API, LLM (OpenAI/Gemini), Telegram Bot |

---

## Quick Start

### 1. Database

```bash
cd backend
make db-migrate   # create all tables
make db-seed      # insert sample data (optional)
```

Reset from scratch:

```bash
make db-reset     # drop → migrate → seed
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in values (see env section below)
make run               # → http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # → http://localhost:3000
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
SERVER_PORT=8080

# PostgreSQL — set DATABASE_URL or individual fields
DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require
# DB_HOST=...
# DB_PORT=5432
# DB_USER=...
# DB_PASSWORD=...
# DB_NAME=...

# Google OAuth2 + Calendar/Gmail APIs
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URL=http://localhost:8080/auth/google/callback

# LLM (text → event parsing)
LLM_API_KEY=...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4

# Telegram Bot (UC11)
TELEGRAM_BOT_TOKEN=...
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

---

## Telegram Bot (UC11)

The bot lets users manage their calendar via natural-language Telegram messages.

**Supported commands:**

| Input | Action |
|---|---|
| `"dinner with mum at 7pm tomorrow"` | Parses text via LLM and creates a calendar event |
| `"any pending requests"` | Lists pending event requests |
| Inline accept/decline button tap | Responds to an event request |

**Webhook endpoint:**

```
POST /telegram/webhook
```

**Setup:**

1. Create a bot via [@BotFather](https://t.me/botfather) and copy the token into `TELEGRAM_BOT_TOKEN`.
2. Register the webhook with Telegram (replace `<TOKEN>` and `<YOUR_PUBLIC_URL>`):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_PUBLIC_URL>/telegram/webhook"
```

3. For local development, use [ngrok](https://ngrok.com/) or similar to expose `localhost:8080`.

**How it works:**

Telegram sends a POST to `/telegram/webhook` for every update. The handler decodes the update, identifies whether it's a text message or a callback (button tap), and delegates to the `telegram.Service` use case. Natural-language messages are forwarded to the LLM text parser (UC12) which extracts event details and creates the event.

---

## API Routes

**Auth (UC1)**
| Method | Path | Notes |
|---|---|---|
| GET | `/auth/google/login` | Redirects to Google OAuth |
| GET | `/auth/google/callback` | OAuth callback, sets session cookie |
| POST | `/auth/logout` | Clears session |
| GET | `/auth/me` | Returns current user |

**Users**
| Method | Path |
|---|---|
| GET | `/users/{userId}` |
| GET | `/users?email=` |
| PUT | `/users` |
| DELETE | `/users/{userId}` |

**Groups (UC2)**
| Method | Path |
|---|---|
| POST | `/groups` |
| POST | `/groups/join` |
| GET | `/groups` |
| GET | `/groups/{groupId}` |
| GET | `/groups/{groupId}/members` |
| DELETE | `/groups/{groupId}` |

**Calendar (UC3–5)**
| Method | Path |
|---|---|
| GET | `/calendar` |
| GET | `/groups/{groupId}/calendar` |
| GET | `/groups/{groupId}/availability` |

**Events (UC6)**
| Method | Path |
|---|---|
| POST | `/events` |
| PUT | `/events/{eventId}` |
| DELETE | `/events/{eventId}` |

**Event Requests (UC7–8)**
| Method | Path |
|---|---|
| POST | `/event-requests` |
| POST | `/event-requests/{requestId}/respond` |
| DELETE | `/event-requests/{requestId}` |
| GET | `/event-requests/pending` |
| GET | `/event-requests/received` |
| GET | `/event-requests/sent` |
| GET | `/event-requests/{requestId}` |

**Notifications (UC9)**
| Method | Path |
|---|---|
| GET | `/notifications` |
| POST | `/notifications/{notificationId}/read` |

**Sync (UC10)**
| Method | Path |
|---|---|
| POST | `/sync/google` |
| POST | `/sync/apple` |

**Text Parser / Telegram (UC11–12)**
| Method | Path |
|---|---|
| POST | `/events/parse-text` |
| POST | `/telegram/webhook` |

**Docs**
| Method | Path |
|---|---|
| GET | `/docs` | Swagger UI |
| GET | `/docs/openapi.json` | OpenAPI spec |

---

## Frontend Commands

```bash
npm run dev    # dev server
npm run build  # production build
npm run start  # production server
npm run lint   # ESLint
```

## Backend Commands

```bash
make run          # go run ./cmd/app
make db-migrate   # run migrations
make db-seed      # seed sample data
make db-reset     # drop + migrate + seed
```

---

## Dev Tools

A backend test page is available at `/dev/backend-test` in the frontend. Useful for verifying CORS, auth headers, and basic endpoint connectivity without needing a REST client.
