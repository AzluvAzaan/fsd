# FSD Frontend

Low-friction web frontend starter for FSD.

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- next-themes

## Goals of this setup

- Keep the initial setup simple and easy to extend
- Let you test the existing Go backend quickly
- Give the project a clean structure for future pages and features
- Avoid over-engineering early

## Project structure

```text
src/
  app/
    dev/
      backend-test/     # simple page for testing current backend endpoints
    layout.tsx          # global app layout + providers
    page.tsx            # starter landing page
  components/
    backend/            # feature components for backend testing/dev tools
    layout/             # app shell / navigation wrappers
    ui/                 # shadcn/ui components
  lib/
    api.ts              # backend API helpers
    env.ts              # frontend env access
    query-client.ts     # TanStack Query client factory
    utils.ts            # shared utility helpers
```

## Local development

### 1) Start the backend

From the repo root:

```bash
cd backend
go run ./cmd/app
```

Or with Make:

```bash
cd backend
make run
```

The current frontend assumes the backend runs on:

```text
http://localhost:8080
```

### 2) Configure frontend env

Copy the example env file:

```bash
cd frontend
cp .env.example .env.local
```

Default value:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

### 3) Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Backend testing page

A simple test page is available at:

```text
/dev/backend-test
```

It currently helps you test the most complete backend slice in the repo:

- `PUT /users`
- `GET /users?email=...`
- `GET /users/{id}` (used for a quick connectivity signal)

This is meant to confirm that:

- your frontend env is correct
- CORS is working
- the frontend can create/read data from the Go backend

## Notes for future development

### When to add FullCalendar

Do **not** add it immediately unless your wireframes already require a richer scheduling UI.

Add it when you need things like:

- week/day calendar grids
- drag-and-drop events
- advanced event rendering
- denser scheduling interactions

Until then, basic cards/lists/custom views are easier to maintain.

### Suggested next pages

Good pages to build next:

- sign in / onboarding
- dashboard
- groups list
- group details
- calendar / availability view
- notifications
- event request flows

### Suggested feature growth pattern

As the app grows, create feature-oriented folders under `src/components` and `src/lib` only when needed. Keep the structure simple until the product earns more complexity.

## Commands

```bash
npm run dev    # run dev server
npm run build  # production build
npm run start  # run production server
npm run lint   # lint the project
```
