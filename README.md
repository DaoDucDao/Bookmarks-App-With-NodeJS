# Bookmarks

A learning project: build a small fullstack bookmarks app, layering on production concerns one step at a time.

- **Backend** — Express 5 + TypeScript + SQLite (`better-sqlite3`), Zod for validation
- **Frontend** — React 19 + Vite + Tailwind v4
- **Layout** — npm workspaces monorepo (`apps/api`, `apps/web`)

## Getting started

```powershell
npm install              # installs deps for all workspaces (hoisted to root)
npm run dev:api          # starts the API on http://localhost:2607
npm run dev:web          # starts the web app on http://localhost:5173
npm run test:api         # vitest + supertest
npm run test:web         # vitest + testing-library
```

The API reads config from `.env` (see `.env.example`). Required keys:

| Key            | Default                  | Notes                          |
| -------------- | ------------------------ | ------------------------------ |
| `NODE_ENV`     | `development`            | `development \| production \| test` |
| `PORT`         | `2607`                   |                                |
| `DATABASE_PATH`| `data.db`                | SQLite file path               |
| `CORS_ORIGIN`  | `http://localhost:5173`  | Frontend origin allowed by CORS |

## Project structure

```
apps/
  api/        Express API
    src/
      app.ts          # Express app wiring (export for tests)
      index.ts        # server entrypoint (app.listen)
      config.ts       # zod-validated env config
      db.ts           # better-sqlite3 connection
      routes/         # route modules
      middleware/     # error-handler, not-found
      lib/            # shared utilities (errors, etc.)
    tests/            # vitest + supertest
  web/        React frontend
```

## Learning path — progress

The backend track layers on one production concern per step.

- [x] **Step 1** — Node + TypeScript project setup (`tsconfig`, `tsx` for dev)
- [x] **Step 2** — Minimal Express server with a hello-world route
- [x] **Step 3** — SQLite via `better-sqlite3` (WAL mode, schema bootstrap, seed)
- [x] **Step 4** — Bookmarks read routes (`GET /bookmarks`, `GET /bookmarks/:id`)
- [x] **Step 5** — Full CRUD (`POST` / `PUT` / `DELETE`) with `201` / `204` semantics
- [x] **Step 6** — Zod request validation (body + URL params)
- [x] **Step 7** — Custom `HttpError` class + centralized `errorHandler` middleware
- [x] **Step 8** — `notFoundHandler` for unmatched routes (404 JSON response)
- [x] **Step 9** — CORS configured for the frontend origin
- [x] **Step 10** — Env config validated by Zod (`config.ts`), fail-fast on bad env
- [ ] **Step 11** — Structured logging with `pino` (+ `pino-http`) ← **next**
- [ ] **Step 12** — Request IDs (correlation IDs threaded through logs)
- [ ] **Step 13** — Security headers (`helmet`)
- [ ] **Step 14** — Rate limiting (`express-rate-limit`)
- [ ] **Step 15** — Health & readiness endpoints (`/healthz`, `/readyz`)
- [ ] **Step 16** — Graceful shutdown (SIGTERM, drain connections, close DB)
- [ ] **Step 17** — Database migrations (replace `CREATE TABLE IF NOT EXISTS` bootstrap)
- [ ] **Step 18** — Pagination + filtering on list endpoints
- [ ] **Step 19** — Authentication (sessions or JWT)

Side work outside the learning path:
- [x] Split into npm workspaces (`apps/api` + `apps/web`)
- [x] Vitest + Supertest test harness, `app.ts` extracted from `index.ts` for testability
- [x] React frontend scaffold with Vite + Tailwind v4
