# FSD Frontend Master Plan

_Last updated: 2026-03-22_

This file is the working blueprint for the FSD web app frontend.

The goal is simple:
- make future implementation low-friction
- make handoff between sessions easy
- keep product, design, routes, data, and implementation direction in one place

Future sessions should treat this file as the main frontend reference before building.

---

# 1. Project Context

## Product

**FSD** is a group calendar coordination system.

The core product idea, based on the backend and current wireframes, is:
- users sign in
- sync calendars
- create or join groups
- view personal and group calendars
- find shared free time
- create event proposals / requests
- receive notifications and pending request updates
- optionally use integrations and text-assisted event creation later

## Current repository shape

```text
fsd/
  backend/
  frontend/
```

### Backend facts already known

The Go backend currently has domains for:
- auth
- users
- groups
- calendar
- events
- event requests
- notifications
- sync / integrations
- text parsing
- Telegram bot hooks

### Backend maturity right now

Most complete backend slice:
- `users`

Mostly scaffolded / partially implemented:
- groups
- calendar
- events
- event requests
- notifications
- Google auth / Google calendar sync
- LLM parsing

This matters because the frontend should be built in a way that can:
- use mock data first
- plug real APIs in later
- avoid rewrites when backend endpoints become complete

## Frontend stack decision

Chosen stack:
- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **TanStack Query**
- **React Hook Form**
- **Zod**
- **Lucide React**
- **next-themes**

Package manager preference:
- **npm**

---

# 2. Product Vision for the Web App

This is not a generic dashboard app.

The frontend should feel like:
- a **modern scheduling workspace**
- optimized for **calendar visibility + coordination**
- useful for both **individual planning** and **group alignment**

## Core product pillars

### 1) Personal calendar clarity
User should quickly understand:
- what’s on their calendar
- where they are busy
- what requests are waiting

### 2) Group coordination
User should be able to:
- create groups
- join groups
- inspect group members
- compare / understand overlapping availability

### 3) Shared free slot discovery
This is the heart of the product.
The app should make it easy to:
- select a group
- pick a date range / constraints
- view candidate free slots
- act on a slot

### 4) Event request workflow
The app should support:
- proposing a time
- sending a request
- reviewing responses
- resolving pending actions

### 5) Integrations
The app should later connect to:
- Google auth
- Google Calendar sync
- possibly text/AI-assisted event entry

---

# 3. Design Language

This section should guide implementation decisions so the coded app stays visually coherent.

## Design tone

The accessible wireframes suggest this product should feel:
- clean
- soft
- modern
- light and breathable
- productivity-focused
- not overly corporate
- not noisy or visually dense

## UI personality

Think:
- polished student/startup productivity tool
- friendly but mature
- simple enough to feel fast
- structured enough to feel reliable

## Core visual patterns observed

From the prototype screens we could access:
- left sidebar navigation
- top utility/search bar
- central main content area
- contextual right rail / details panel
- rounded cards and pills
- purple accent for active state / CTA emphasis
- lots of whitespace
- soft borders instead of aggressive dividers

## Layout behavior principles

### Use a 3-zone layout on core app pages

For the main product workspace:
- **left:** persistent sidebar navigation
- **center:** main page content
- **right:** contextual rail when needed

Not every page must use the right rail, but calendar-heavy pages should.

### Density rules

- landing/auth: relaxed spacing
- calendar workspace: medium density
- lists/notifications: medium density
- forms: compact but not cramped

### Motion/interaction rules

- subtle transitions only
- soft hover states
- no flashy animation by default
- emphasis through color, spacing, and hierarchy

---

# 4. Color Palette

The product needs both light and dark mode.

The request is:
- light mode = **white + purple** direction
- dark mode = **grey + purple** direction

Below is a practical working palette.

## Light mode palette

### Base surfaces
- Background: `#F7F7FB`
- App surface: `#FFFFFF`
- Secondary surface: `#F1F2F8`
- Border: `#E6E7F0`

### Text
- Primary text: `#17181C`
- Secondary text: `#666B7A`
- Muted text: `#8A90A2`

### Purple system
- Primary purple: `#5B4DFF`
- Primary hover: `#4D3FF0`
- Primary soft bg: `#EFEDFF`
- Active nav bg: `#5B4DFF`
- Active nav text: `#FFFFFF`

### Semantic
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`
- Info: `#2563EB`

## Dark mode palette

### Base surfaces
- App background: `#121318`
- Main surface: `#181A21`
- Secondary surface: `#20232C`
- Elevated surface: `#252836`
- Border: `#2D3140`

### Text
- Primary text: `#F5F7FB`
- Secondary text: `#B6BDCF`
- Muted text: `#8F97AA`

### Purple system
- Primary purple: `#7C72FF`
- Primary hover: `#6D63F6`
- Primary soft bg: `#2B2757`
- Active nav bg: `#7C72FF`
- Active nav text: `#FFFFFF`

### Semantic
- Success: `#22C55E`
- Warning: `#FBBF24`
- Error: `#F87171`
- Info: `#60A5FA`

## Usage rules

- Purple is the main product accent, not every surface color.
- Most surfaces should stay neutral.
- Use purple for:
  - primary CTA
  - active nav item
  - selected date/day/event accents
  - badges / active states / highlights
- Do **not** flood large content areas with purple.

---

# 5. Typography, Radius, and Spacing

## Typography direction

Use clean sans-serif defaults.
The current scaffold already uses Geist, which is good enough.

### Suggested hierarchy
- Page title: 28–36px / semibold
- Section title: 18–22px / semibold
- Card title: 14–16px / medium-semibold
- Body: 14–16px
- Meta labels: 12–13px

## Radius

Use rounded corners consistently:
- small controls: `rounded-md` / `rounded-lg`
- cards/panels: `rounded-xl` / `rounded-2xl`
- hero/major containers: `rounded-2xl` / `rounded-3xl`

## Shadows

Keep shadows soft and sparse.
Prefer:
- subtle borders
- soft elevation only where needed

## Spacing

Prefer generous spacing on shell pages.
Do not compress the UI too early.

---

# 6. Information Architecture

This is the main product map.

## Public area

### `/`
Purpose:
- landing page
- explain product value
- drive login/signup

### `/login`
Purpose:
- sign in
- eventually Google auth entrypoint

### Optional later
- `/about`
- `/privacy`
- `/terms`
- `/contact`

These are lower priority.

## Authenticated app area

Use `/app/*` routes.

### `/app`
Purpose:
- redirect to default workspace page

Recommendation:
- redirect to `/app/calendar`

### `/app/calendar`
Purpose:
- personal calendar workspace
- default logged-in home

### `/app/groups`
Purpose:
- group index page
- list groups user belongs to
- entry point for creating/joining groups

### `/app/groups/[groupId]`
Purpose:
- group home / overview page
- members + summary + actions

### `/app/groups/[groupId]/calendar`
Purpose:
- group calendar view
- merged availability or group event perspective

### `/app/groups/[groupId]/availability`
Purpose:
- free slot analysis view
- date range selection + result display

### `/app/requests`
Purpose:
- event proposals and responses
- inbox-like request center

### `/app/notifications`
Purpose:
- notification feed
- reminders / updates / system notices

### `/app/integrations`
Purpose:
- Google calendar sync state
- future integrations

### `/app/settings`
Purpose:
- profile settings
- preferences
- theme settings
- maybe account linking

### `/app/profile`
Optional if needed later.
Can also be merged into settings.

## Internal/dev area

### `/dev/backend-test`
Purpose:
- verify frontend-backend wiring quickly during development

Keep this until the app is much more mature.

---

# 7. Main Screens We Will Need

This section focuses on the primary screens, not every micro-state.

## Public screens

### 1. Landing page
Sections:
- top nav
- hero section
- product explanation / benefits
- feature highlights
- CTA section
- footer

### 2. Login page
Sections:
- brand / intro copy
- login form or Google login CTA
- support links

### 3. Optional onboarding page(s)
Needed only if the final product flow requires more than login.
Could include:
- connect calendar
- set display name
- create first group

## App screens

### 4. Personal calendar page
This is a core screen.

Sections:
- app shell
- search bar / utility row
- date range header
- calendar mode toggle (week/month later if needed)
- weekly grid
- selected day detail rail
- pending requests summary / quick panel

### 5. Groups list page
Sections:
- page header
- create group CTA
- join group CTA
- group cards/list
- empty state if none

### 6. Group details page
Sections:
- group header
- invite/share actions
- member list
- group summary cards
- quick links to calendar/availability

### 7. Group calendar page
Sections:
- group header
- date controls
- member filters
- merged calendar / busy blocks
- member legend or participation indicators

### 8. Availability page
Sections:
- group selector (implicit if nested)
- date range form
- duration / constraints
- free slot result cards or time grid
- propose/send request CTA

### 9. Requests page
Sections:
- pending requests
- sent requests
- received requests
- request detail / action panel

### 10. Notifications page
Sections:
- notification list
- unread/read grouping
- quick actions where useful

### 11. Integrations page
Sections:
- Google integration card
- sync status
- sync action buttons
- future integration placeholders

### 12. Settings page
Sections:
- profile basics
- theme toggle
- preferences
- linked accounts/integrations summary

## Modal / drawer screens we will likely need

### Create group modal/page
Fields:
- group name
- description optional

### Join group modal/page
Fields:
- invite code or invite link

### Create event modal/page
Fields:
- title
- date/time
- type
- notes

### Send event request modal/page
Fields:
- target group or recipient(s)
- candidate slot
- message/context

### Event details drawer/modal
Fields:
- time
- participants
- source
- actions

---

# 8. Primary User Flows

This is the product flow view, not just the route list.

## Flow 1 — Visitor to user

1. visitor lands on `/`
2. understands value proposition
3. clicks log in / get started
4. goes to `/login`
5. authenticates
6. lands in `/app/calendar`

## Flow 2 — Personal scheduling

1. user opens personal calendar
2. sees weekly view
3. inspects today / selected day
4. views details in right rail
5. later adds or edits a manual event

## Flow 3 — First-time group coordination

1. user opens groups page
2. creates a group or joins via invite
3. enters group detail page
4. sees members and available actions
5. proceeds to group calendar or availability view

## Flow 4 — Find a shared free slot

1. user opens a group
2. clicks availability / find a time
3. selects range + duration + constraints
4. receives candidate slots
5. selects a slot
6. optionally creates an event request

## Flow 5 — Handle event requests

1. user opens requests page or sees request in notifications
2. reviews request details
3. accepts / rejects / comments later
4. request state updates

## Flow 6 — Integration setup

1. user visits integrations page
2. connects Google account/calendar
3. syncs events
4. sees updated personal calendar data

## Flow 7 — Notification review

1. user opens notifications
2. sees unread items and system updates
3. navigates into relevant page from notification context

---

# 9. Route and Screen Mapping Table

| Route | Screen | Priority | Data Source Initially |
|---|---|---:|---|
| `/` | Landing | P1 | static content |
| `/login` | Login | P1 | static / placeholder auth |
| `/app/calendar` | Personal calendar | P1 | mock data first, real later |
| `/app/groups` | Group list | P1 | mock first |
| `/app/groups/[groupId]` | Group overview | P1 | mock first |
| `/app/groups/[groupId]/calendar` | Group calendar | P2 | mock first |
| `/app/groups/[groupId]/availability` | Availability explorer | P1 | mock first |
| `/app/requests` | Requests center | P1 | mock first |
| `/app/notifications` | Notifications | P1 | mock first |
| `/app/integrations` | Integrations | P1 | mock first |
| `/app/settings` | Settings | P2 | mostly static first |
| `/dev/backend-test` | Backend dev page | P0 | real backend now |

---

# 10. Folder Structure

This is the recommended target structure for the frontend.

```text
frontend/
  public/

  src/
    app/
      (public)/
        page.tsx
        login/
          page.tsx
      (app)/
        app/
          layout.tsx
          page.tsx
          calendar/
            page.tsx
          groups/
            page.tsx
            [groupId]/
              page.tsx
              calendar/
                page.tsx
              availability/
                page.tsx
          requests/
            page.tsx
          notifications/
            page.tsx
          integrations/
            page.tsx
          settings/
            page.tsx
      dev/
        backend-test/
          page.tsx

    components/
      layout/
        app-shell.tsx
        app-sidebar.tsx
        app-topbar.tsx
        app-right-rail.tsx
        marketing-header.tsx
        marketing-footer.tsx
      shared/
        page-header.tsx
        section-card.tsx
        stat-card.tsx
        empty-state.tsx
        search-input.tsx
        badge.tsx
      calendar/
        week-calendar.tsx
        calendar-toolbar.tsx
        time-grid.tsx
        event-card.tsx
        day-detail-panel.tsx
        pending-requests-panel.tsx
      groups/
        group-card.tsx
        group-list.tsx
        group-header.tsx
        member-list.tsx
        invite-panel.tsx
      availability/
        availability-filter-form.tsx
        slot-card.tsx
        slot-list.tsx
        availability-summary.tsx
      requests/
        request-card.tsx
        request-list.tsx
        request-detail-panel.tsx
      notifications/
        notification-list.tsx
        notification-item.tsx
      integrations/
        integration-card.tsx
        sync-status-card.tsx
      forms/
        login-form.tsx
        create-group-form.tsx
        join-group-form.tsx
        create-event-form.tsx
        event-request-form.tsx

    lib/
      api/
        client.ts
        users.ts
        groups.ts
        calendars.ts
        events.ts
        requests.ts
        notifications.ts
        integrations.ts
      hooks/
        use-current-user.ts
        use-groups.ts
        use-group.ts
        use-calendar.ts
        use-notifications.ts
        use-requests.ts
      schemas/
        auth.ts
        group.ts
        event.ts
        request.ts
      constants/
        nav.ts
        mock-data.ts
        theme.ts
      env.ts
      query-client.ts
      utils.ts

    types/
      user.ts
      group.ts
      calendar.ts
      event.ts
      request.ts
      notification.ts
```

## Structure rules

- put page composition in `app/`
- put reusable UI in `components/`
- keep API functions domain-based in `lib/api/`
- keep validation schemas in `lib/schemas/`
- keep custom hooks thin and predictable
- do not create too many abstraction layers too early

---

# 11. Component System Priorities

Build these first.

## Layout primitives
- `AppShell`
- `AppSidebar`
- `AppTopbar`
- `AppRightRail`
- `MarketingHeader`
- `MarketingFooter`

## Shared UI primitives
- `PageHeader`
- `SectionCard`
- `StatCard`
- `EmptyState`
- `SearchInput`
- `AvatarGroup`
- `StatusBadge`

## Calendar components
- `CalendarToolbar`
- `DateRangeHeader`
- `WeekCalendar`
- `TimeGrid`
- `EventCard`
- `DayDetailPanel`
- `PendingRequestsPanel`

## Groups components
- `GroupCard`
- `GroupList`
- `GroupHeader`
- `MemberList`
- `InvitePanel`

## Availability components
- `AvailabilityFilterForm`
- `SlotCard`
- `SlotList`
- `AvailabilitySummary`

## Request components
- `RequestCard`
- `RequestList`
- `RequestDetailPanel`

## Form components
- `LoginForm`
- `CreateGroupForm`
- `JoinGroupForm`
- `CreateEventForm`
- `EventRequestForm`

---

# 12. Data and API Strategy

## Principles

- UI first, data second
- static/mock data before blocked backend domains
- real API integration where backend is already usable
- one domain module per API area

## Initial API modules

- `lib/api/client.ts`
- `lib/api/users.ts`
- `lib/api/groups.ts`
- `lib/api/calendars.ts`
- `lib/api/events.ts`
- `lib/api/requests.ts`
- `lib/api/notifications.ts`
- `lib/api/integrations.ts`

## TanStack Query usage

Use TanStack Query for:
- current user
- groups list/detail
- calendar data
- notifications
- requests

Do **not** use it for:
- local modal open state
- form field state
- small UI toggles

## React Hook Form + Zod usage

Use for:
- login
- create group
- join group
- create event
- propose/send request
- future settings forms

## Mocking policy

Until backend domains are ready:
- page and components should still be real
- use mock objects in `lib/constants/mock-data.ts`
- keep mock shape close to expected backend shape

That way replacing mock data later is easy.

---

# 13. Backend Domain to Frontend Page Mapping

| Backend Domain | Frontend Surface |
|---|---|
| auth | login, session handling, onboarding |
| user | profile/topbar identity/settings |
| group | groups list, group detail, memberships |
| calendar | personal calendar, group calendar |
| event | event cards, event detail, create/edit event |
| event requests | requests center, pending actions |
| notifications | notifications page, right rail summaries |
| sync | integrations page |
| textparser | later: quick-add / natural language event creation |

---

# 14. Implementation Phases

## Phase 0 — Already done / in progress
- starter Next frontend scaffolded
- basic backend test page exists
- README exists
- this master plan exists

## Phase 1 — Shell + route skeleton

Build:
- `(public)` route group
- `(app)` route group
- app shell
- sidebar
- topbar
- right rail pattern

Deliverables:
- navigation structure exists
- all major routes render
- no route is a dead end

## Phase 2 — Static high-fidelity pages

Build static/mock versions of:
- landing
- login
- calendar
- groups
- group detail
- availability
- requests
- notifications
- integrations

Deliverables:
- product looks like a real app
- visual system is established
- screens can be reviewed against wireframes

## Phase 3 — Real user/backend plumbing

Wire:
- backend test page remains
- user queries become real where possible
- basic session placeholder pattern introduced

Deliverables:
- proven frontend-backend integration conventions

## Phase 4 — Group + request flows

Implement:
- create/join group forms
- group detail interactions
- requests UI structure

Use mock data if backend incomplete.

## Phase 5 — Calendar refinement

Implement:
- strong weekly calendar page
- event cards
- detail panel
- day selection behavior
- availability result UI

Evaluate FullCalendar only if necessary.

## Phase 6 — Auth and integrations

Implement when backend is ready:
- Google login flow
- sync UI
- real integration status

## Phase 7 — Polish

- dark mode tuning
- empty/loading/error states
- mobile responsiveness
- accessibility pass
- data-state polish

---

# 15. MVP Scope Recommendation

The best MVP for the web app is:

## MVP Pages
- landing
- login
- personal calendar
- groups list
- group detail
- availability
- requests
- notifications
- integrations

## MVP Capabilities
- navigate through all main screens
- show realistic mock content everywhere
- connect at least one backend slice for proof
- have reusable shell and design language in place

## Not required for MVP
- every integration fully working
- advanced recurring event flows
- complete admin/settings complexity
- complex permissions system on the frontend

---

# 16. Dark Mode Rules

Dark mode should not just invert colors badly.

## Direction
- use neutral greys as base
- keep purple as the accent
- maintain soft contrast
- avoid pure black surfaces everywhere

## Rules
- background = dark grey, not true black
- cards = slightly elevated grey surfaces
- purple remains vivid enough for active elements
- text should stay easy to scan
- borders must still be visible but subtle

## Good dark mode targets
- calendar grid remains legible
- right rail still feels separated
- sidebar active state remains clearly purple
- muted text remains readable

---

# 17. States Every Major Screen Needs

Do not forget these during implementation.

For every important page, think about:
- default state
- loading state
- empty state
- error state
- populated state

Examples:
- no groups yet
- no notifications yet
- no pending requests
- no availability results found
- calendar sync disconnected

---

# 18. Design-to-Code Rules

To avoid messy implementation:

1. Do not create one component per entire Figma frame.
2. Build reusable sections and compose pages from them.
3. Prefer feature folders over random generic dumping grounds.
4. Keep layout components stable early.
5. Keep data boundaries clean.
6. Use mock data to validate the UX before over-wiring APIs.
7. Compare pages to wireframes often.

---

# 19. Immediate Next Tasks

These are the recommended next build steps from this plan.

## Task 1
Create `(public)` and `(app)` route groups.

## Task 2
Build the authenticated app shell:
- sidebar
- topbar
- right rail placeholder

## Task 3
Build a static `/app/calendar` page aligned to the visible weekly calendar wireframe.

## Task 4
Build static pages for:
- `/app/groups`
- `/app/groups/[groupId]`
- `/app/availability` equivalent nested flow
- `/app/requests`
- `/app/notifications`
- `/app/integrations`

## Task 5
Create a proper light + dark theme token layer.

## Task 6
Keep `/dev/backend-test` working as a known-good integration checkpoint.

---

# 20. Definition of Success for This Plan

This file is successful if future sessions can:
- read it once
- understand the product direction quickly
- know which routes and components to build next
- know the visual language to follow
- know where backend integration fits
- continue implementation without re-deciding everything from scratch

---

# 21. Short Summary

FSD should be built as a clean, purple-accented, calendar-first web app with:
- a public landing/auth layer
- an authenticated workspace shell
- strong personal + group calendar flows
- availability discovery as a core feature
- request/notification handling as supporting product flows
- a scalable but not overengineered folder structure
- light mode and dark mode from the start

This `PLAN.md` should remain the source of truth for frontend implementation direction until the product matures enough to split docs further.
