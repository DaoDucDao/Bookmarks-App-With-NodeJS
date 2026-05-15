# Bookmarks

A learning project: build a small fullstack bookmarks app, layering on production concerns one step at a time.

- **Backend** — Express 5 + TypeScript + SQLite (`better-sqlite3`), Zod for validation
- **Frontend** — React 19 + Vite + Tailwind v4, Zod for client-side validation
- **Layout** — npm workspaces monorepo (`apps/api`, `apps/web`)
- **Testing** — Vitest everywhere; Supertest for the API, React Testing Library for the web app

## Getting started

```powershell
npm install              # installs deps for all workspaces (hoisted to root)

npm run dev:api          # API on http://localhost:2607
npm run dev:web          # Web on http://localhost:5173

npm run test:api         # API suite (14 tests, supertest)
npm run test:web         # Web suite (7 tests, RTL + jsdom)

# Per workspace, you can also run typechecks:
npm run typecheck --workspace=apps/api
npm run typecheck --workspace=apps/web
```

The API reads config from `.env` (see `.env.example`). Required keys:

| Key             | Default                  | Notes                               |
| --------------- | ------------------------ | ----------------------------------- |
| `NODE_ENV`      | `development`            | `development \| production \| test` |
| `PORT`          | `2607`                   |                                     |
| `DATABASE_PATH` | `data.db`                | SQLite file path (`:memory:` in tests) |
| `CORS_ORIGIN`   | `http://localhost:5173`  | Frontend origin allowed by CORS     |

## Project structure

```
apps/
  api/                    Express API
    src/
      app.ts              Express app wiring (exported for tests)
      index.ts            server entrypoint — app.listen
      config.ts           Zod-validated env config
      db.ts               better-sqlite3 connection + schema bootstrap
      routes/             route modules
      middleware/         error-handler, not-found
      lib/                shared utilities (HttpError, etc.)
    tests/                vitest + supertest

  web/                    React frontend
    src/
      App.tsx             shell — header + main content
      main.tsx            React entrypoint
      Components/         JSX components (BookmarksList, BookmarkForm, BookmarkRow, ThemeToggle)
      api/                fetch helpers (bookmarks.ts)
      hooks/              custom hooks (useTheme)
      validation/         Zod schemas (bookmark.ts)
      index.css           Tailwind import + dark mode variant
    tests/                vitest + React Testing Library
```

## Learning path — progress

Three parallel tracks. Each step builds on the previous one and folds in one new concept.

### Backend track

- [x] **Step 1** — Project setup (TypeScript + `tsx` for dev, NodeNext modules)
- [x] **Step 2** — Minimal Express server (hello-world route, `app.listen`)
- [x] **Step 3** — SQLite via `better-sqlite3` (WAL mode, schema bootstrap, seed)
- [x] **Step 4** — Read routes (`GET /bookmarks`, `GET /bookmarks/:id`)
- [x] **Step 5** — Full CRUD (`POST` / `PUT` / `DELETE` with `201` / `204` semantics, `RETURNING *`)
- [x] **Step 6** — Zod request validation (body + URL params)
- [x] **Step 7** — Custom `HttpError` class + centralized `errorHandler` middleware
- [x] **Step 8** — `notFoundHandler` for unmatched routes (404 JSON response)
- [x] **Step 9** — CORS configured for the frontend origin
- [x] **Step 10** — Env config validated by Zod (`config.ts`), fail-fast on bad env
- [x] **Step 11** — Vitest + Supertest test harness (`app.ts` extracted from `index.ts` for testability, in-memory SQLite for tests)
- [x] **Step 12** — Structured logging with `pino` (+ `pino-http`)
- [x] **Step 13** — Request IDs / correlation IDs threaded through logs
- [x] **Step 14** — Security headers (`helmet`) + body-size limit
- [x] **Step 15** — Rate limiting (`express-rate-limit`)
- [x] **Step 16** — Health & readiness endpoints (`/healthz`, `/readyz`)
- [x] **Step 17** — Graceful shutdown (SIGTERM, drain connections, close DB)
- [x] **Step 18** — Database migrations (replace `CREATE TABLE IF NOT EXISTS` bootstrap)
- [x] **Step 19** — Authentication (sessions or JWT) + per-user bookmarks

### Frontend track

- [x] **Step 1** — React 19 + Vite + TypeScript scaffold
- [x] **Step 2** — Typed API client (`fetch` helpers + shared `Bookmark` type)
- [x] **Step 3** — Bookmarks list page with loading / error / empty states
- [x] **Step 4** — Full CRUD UI (create form, inline edit, delete) with server-confirmed state updates (no refetch after mutation)
- [x] **Step 5** — Component decomposition (`BookmarksList` → `BookmarkForm` + `BookmarkRow`)
- [x] **Step 6** — Vitest + React Testing Library (jsdom env, module mocks for the API client)
- [x] **Step 7** — Tailwind v4 styling (class-based, no `tailwind.config.js`)
- [x] **Step 8** — Dark mode toggle (`useTheme` hook, system preference + `localStorage`, `@custom-variant`)
- [x] **Step 9** — Client-side Zod validation with per-field errors and clear-on-edit UX
- [ ] **Step 10** — Surface backend validation errors per field (read API's Zod issues) ← **next**
- [ ] **Step 11** — Skeleton + transition polish, accessibility audit pass
- [ ] **Step 12** — `react-hook-form` + `@hookform/resolvers/zod` to replace manual form state
- [ ] **Step 13** — Optimistic updates (mutate local state first, roll back on failure)
- [ ] **Step 14** — Error boundaries + retry UX
- [ ] **Step 15** — Client-side routing (react-router or tanstack-router)
- [ ] **Step 16** — Authentication UI (login/register, protected routes, token storage)

### Repo / shared track

- [x] npm workspaces monorepo (`apps/api`, `apps/web`)
- [x] Root scripts proxying to workspaces (`dev:api`, `dev:web`, `test:api`, `test:web`)
- [x] Consistent `tests/` folder name in both apps
- [ ] CI — GitHub Actions running both test suites on push
- [ ] Build + start scripts for production (`tsc` for the API, `vite build` for the web)
- [ ] Dockerfile per service (or `docker-compose.yml` for both)
- [ ] Deployment (Railway / Render / Fly) with hosted SQLite or Postgres swap

## Notes

- The two test runners are independent — both are Vitest, but they have separate configs and run-time environments (Node for API, jsdom for web). They can be run in parallel without conflict.
- Tests never touch your real `data.db` — the API test process opens an in-memory SQLite instead, configured in [`apps/api/vitest.config.ts`](apps/api/vitest.config.ts).
