# TodoApp — Copilot Instructions

## Project Overview

Full-stack Todo application with GitHub Issues integration. Monorepo with `backend/` (Fastify API) and `frontend/` (React SPA), running on Docker Compose with PostgreSQL.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend  | Fastify, TypeScript, Prisma ORM         |
| Database | PostgreSQL 16                           |
| Auth     | GitHub OAuth 2.0                        |
| State    | Zustand (frontend), signed cookies (backend) |
| Testing  | Jest (backend), Vitest (frontend)       |
| Runtime  | Docker Compose                          |

## Project Structure

```
todoapp/
├── backend/
│   ├── prisma/schema.prisma    # User, Task, GitHubRepo models
│   └── src/
│       ├── server.ts           # Fastify entry point
│       ├── config.ts           # Zod env validation
│       ├── lib/crypto.ts       # AES-256-GCM token encryption
│       ├── lib/prisma.ts       # Prisma client singleton
│       ├── plugins/authGuard.ts # Session cookie auth (fastify-plugin)
│       ├── routes/             # auth, tasks, github, health
│       └── services/           # taskService, githubService
└── frontend/
    └── src/
        ├── api/client.ts       # Typed fetch wrapper
        ├── store/              # Zustand (authStore, taskStore)
        ├── hooks/              # useAuth, useTask, useGitHub
        ├── components/         # Board, TaskCard, TaskForm
        └── pages/              # ListPage, SettingsPage
```

## Coding Standards

### TypeScript
- `strict: true` — no exceptions
- Never use `any` — use `unknown` and narrow with type guards
- All function parameters and return types explicitly typed
- Use `interface` for object shapes, `type` for unions/intersections

### Backend (Fastify)
- All route inputs validated with Zod schemas — no raw `request.body` access
- Use Prisma for all database access — no raw SQL string interpolation
- `userId` always read from `request.user` (session cookie) — never from request body
- Structured error responses: `{ error: string, code: string }`
- Use `fastify-plugin` (fp) for plugins that must escape encapsulation
- `buildServer()` exported separately from `main()` for testability

### Frontend (React)
- Functional components only — no class components
- State management via Zustand — no prop drilling beyond 2 levels
- API calls through `src/api/client.ts` — never direct `fetch()` in components
- All interactive elements must have ARIA labels (WCAG 2.1 AA)
- Use `@dnd-kit` for drag-and-drop — not react-beautiful-dnd

### Database (PostgreSQL + Prisma)
- All dates stored as UTC
- Use Prisma transactions for operations touching multiple tables
- Indexes defined in schema.prisma with `@@index` — not raw SQL
- Use `String[]` for labels (PostgreSQL array) — not junction tables
- Cascade deletes configured via `onDelete: Cascade`

### Security
- GitHub tokens stored AES-256-GCM encrypted — never in plaintext
- Webhook endpoint verifies HMAC-SHA256 (`X-Hub-Signature-256`) with `crypto.timingSafeEqual`
- Session cookies: `httpOnly`, `sameSite: lax`, signed with `@fastify/cookie`
- All secrets via environment variables — validated at startup by Zod in `config.ts`
- Webhook route excluded from authGuard but HMAC-verified

### Testing
- Backend: Jest with `ts-jest`, mocks via `jest.mock()`, Fastify `app.inject()` for integration tests
- Frontend: Vitest + React Testing Library, mock API via `vi.mock()`
- All env vars set in `jest.setup.js` (backend) or `setup.ts` (frontend) — never inline in test files
- Test files in `src/__tests__/` directory

### Docker
- Multi-stage Dockerfiles: `development` (hot-reload) and `production` stages
- `docker-compose.yml` for services, `docker-compose.override.yml` for dev volumes
- PostgreSQL healthcheck with `pg_isready` before backend starts

### Git
- Follow Conventional Commits specification
- Commit messages: `type(scope): description` (e.g., `feat(tasks): add priority filter`)
