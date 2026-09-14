# Personal Trading Journal

**Personal Trading Journal** is a web application for logging FOREX trades across multiple trading
accounts and reading performance back out of them — win rate, profit factor, average R:R, pips, and
an equity curve per account.

## Tech Stack

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui (Radix) · TanStack Query · Clerk · sonner

### Backend
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/expressjs-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Node.js (ESM) · Express · Supabase (PostgreSQL) · `node --test` for the unit suite

## Features

- **FOREX trade journal** — log a trade as pair, direction (`LONG`/`SHORT`), lots, entry/exit price,
  stop loss and take profit, plus pips, result, R:R, outcome (`WIN`/`LOSS`/`BE`), session
  (`LONDON`/`NEW_YORK`/`TOKYO`/`SYDNEY`/`OVERLAP`), setup and notes. A trade with no exit price is
  treated as still open. Full create / read / update / delete from the trade log and the account page.
- **Multiple trading accounts** — every trade belongs to a portfolio typed `LIVE`, `DEMO` or `PROP`,
  with its own broker, currency and funded amount. An **account switcher** in the sidebar picks the
  active account, and the dashboard, trade log, analytics and settings all scope themselves to it.
- **Deposits and withdrawals** — cash transactions are recorded against an account separately from
  trade P&L, so funding movements don't get mistaken for performance.
- **Derived balance** — `currentBalance` is never written by a client. The backend recomputes it as
  `initialBalance + Σ trade.result + Σ deposits − Σ withdrawals` after every write that can move it.
- **Analytics** — win rate, profit factor, average R:R, average/largest win and loss, total pips,
  best and worst pair, best session, an equity curve built from trades and cash transactions, and
  breakdowns by pair, session and month. All of it is **computed by the backend**, which is the single
  source of truth; the browser renders the figures and derives none of them. Every aggregate covers
  closed trades only, with open positions reported separately as a count.
- **Authentication** — Clerk protects every route except `/sign-in`, `/sign-up` and `/sso-callback`.
- **Dark navy UI** — shadcn/ui primitives on Tailwind 4 design tokens, with skeleton loading states.

## Getting Started

The repository holds **two independent npm projects** — `backend/` and `frontend/`. There is no root
`package.json` and no monorepo tooling; install and run each one separately.

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or later
- npm
- A [Supabase](https://supabase.com/) project (the backend will not boot without one)
- A [Clerk](https://clerk.com/) instance — see [`documentation/CLERK-SETUP.md`](documentation/CLERK-SETUP.md)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Personal-Trading-Journal.git
   cd Personal-Trading-Journal
   ```

2. **Database:**
   Apply the migrations in `backend/supabase/migrations/` to your Supabase project. The second
   migration reshapes the original stock scaffold into the FOREX model and adds `cash_transactions`;
   its check constraints are the source of truth for the enums above.

3. **Backend setup:**
   ```bash
   cd backend
   npm install
   ```
   Create `backend/.env`:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000                          # optional; 5000 is what the frontend expects
   CORS_ORIGIN=http://localhost:3000  # optional
   ```
   Then start the API on **port 5000**:
   ```bash
   npm start          # or: npm run dev (requires nodemon, which is not in dependencies)
   ```
   > A connection check runs before `app.listen`, so the server exits rather than starting against an
   > unreachable Supabase instance.

4. **Frontend setup:**
   In a new terminal:
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local     # then fill in the Clerk keys
   npm run dev
   ```

The app runs at `http://localhost:3000` and talks to the API at `NEXT_PUBLIC_API_URL`
(`http://localhost:5000` by default).

## Scripts

```bash
# backend/
npm test                                              # node --test — 164 unit tests
node --test tests/services/portService.test.js        # a single file
node --test --test-name-pattern="recalculateBalance"  # a single test
npm start

# frontend/
npm run dev
npm run build
npm run lint          # eslint
npx tsc --noEmit      # typecheck (there is no typecheck script)
```

Controller tests mock the service layer and service tests mock the repository, so the suite runs
without a database. Repositories are deliberately untested.

## Architecture

The backend keeps a strict four-layer flow, one file per entity per layer:

```text
routes/ → controllers/ → services/ → repositories/ → Supabase
                ↕
            mappers/
```

Routes mount at the **root** (`/portfolios`, `/trades`, `/transactions`, `/analytics`). Controllers own
validation and status codes; services own business rules; repositories are the only Supabase callers.

Analytics responses carry a strong `ETag` derived from the account's `updated_at` — which
`recalculateBalance()` stamps after every trade and cash write — plus `Cache-Control: private,
no-cache`. The browser therefore revalidates on every read but only downloads a body when the figures
actually changed, and a matching `If-None-Match` returns `304` without recomputing anything. On the
client, every trade and cash mutation invalidates the `['analytics']` query keys, so a logged trade
updates the dashboard without a refresh.

**The API speaks camelCase, the database stores snake_case**, and `src/mappers/` is the only place the
two meet — snake_case never reaches a client. `toRow` omits any key the caller did not supply, so a
partial update never writes over a column it wasn't asked to touch.

On the frontend, every server interaction goes through the TanStack Query hooks in
`src/hooks/use-portfolios.ts` (never `apiClient` straight from a component); those hooks own their
cache invalidation and their toasts, which keeps components presentational. Note that Next.js 16
renames the `middleware` file convention to **`proxy`** — auth lives in `src/proxy.ts`.

Full endpoint reference: [`backend/README.md`](backend/README.md).

## Project Structure

```text
Personal-Trading-Journal/
├── backend/                  # Express + Supabase REST API (ESM), port 5000
│   ├── src/
│   │   ├── config/           # Supabase client, health check
│   │   ├── controllers/      # validation + HTTP status codes, ETag negotiation
│   │   ├── mappers/          # camelCase API <-> snake_case rows
│   │   ├── repositories/     # the only Supabase callers
│   │   ├── routes/           # portfolios, trades, transactions, analytics
│   │   ├── services/         # business rules (balance recalculation, analytics)
│   │   └── server.js
│   ├── supabase/migrations/  # initial schema + FOREX reshape
│   ├── tests/                # node:test unit suites
│   └── Dockerfile
├── frontend/                 # Next.js 16 App Router, port 3000
│   └── src/
│       ├── app/              # dashboard, trades, analytics, portfolios, settings, auth
│       ├── components/       # dialogs, tables, sidebar, shadcn/ui primitives
│       ├── hooks/            # TanStack Query hooks — the only API entry point
│       ├── lib/              # api client, account context, stats + formatting
│       ├── types/            # shared domain model
│       └── proxy.ts          # Clerk route protection (Next 16 "middleware")
└── documentation/
    ├── CRUD-AUDIT.md         # full trace of the frontend <-> backend contract
    └── CLERK-SETUP.md        # the Clerk values you still need to supply
```

## Working without a backend

`ApiClient` in `frontend/src/lib/api.ts` ships a set of fixtures so the UI can be worked on with
nothing running behind it. They are an **explicit opt-in**, not a fallback:

```env
NEXT_PUBLIC_USE_MOCKS=true   # in frontend/.env.local
```

With the flag on, **GET requests only** are served from the fixtures; writes always go to the real API
and always report their real outcome. With the flag off — the default — nothing is mocked. A failed
request raises an `ApiError` carrying the HTTP status, the `onError` toasts in
`src/hooks/use-portfolios.ts` fire, and a request that never reaches the server says so
(*"Could not reach the API at http://localhost:5000. Is the backend running?"*).

This closes finding F-01 in [`documentation/CRUD-AUDIT.md`](documentation/CRUD-AUDIT.md), where the
client used to swallow connection failures, its own timeout and every non-2xx response, then answer
with mock data — so mutations fired green success toasts whether or not anything was saved.

## Known limitation

The backend does not yet verify the Clerk session token that the frontend attaches as a bearer header,
so the API is unauthenticated. Do not point it at data you care about over a public network.
