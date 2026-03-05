# TodoApp — Task Manager with GitHub Issues Integration

Full-stack Todo app with a Kanban board, list view, two-way GitHub Issues sync, and GitHub OAuth — running entirely on Docker Compose locally.

## Stack

| Layer    | Technology                                          |
|----------|-----------------------------------------------------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS          |
| Backend  | Fastify + TypeScript + Prisma                       |
| Database | PostgreSQL 16                                       |
| Auth     | GitHub OAuth 2.0                                    |
| GitHub   | Octokit REST + Webhooks                             |
| Runtime  | Docker Compose                                      |

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 4.x+ (Compose v2.22+)
- A [GitHub account](https://github.com) (for OAuth + Issues integration)

---

## Quickstart

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd todoapp
cp .env.example .env
```

### 2. Create a GitHub OAuth App

Go to **[GitHub → Settings → Developer settings → OAuth Apps → New OAuth App](https://github.com/settings/applications/new)** and fill in:

| Field                        | Value                                  |
|------------------------------|----------------------------------------|
| Application name             | `TodoApp (local)`                      |
| Homepage URL                 | `http://localhost:5173`                |
| Authorization callback URL   | `http://localhost:3001/auth/callback`  |

Copy the **Client ID** and **Client Secret** into your `.env`:

```env
GITHUB_CLIENT_ID=<your_client_id>
GITHUB_CLIENT_SECRET=<your_client_secret>
```

### 3. Generate secrets

```bash
# 32-byte encryption key (must be exactly 64 hex chars)
echo "TOKEN_ENCRYPTION_KEY=$(openssl rand -hex 32)"

# Session secret
echo "SESSION_SECRET=$(openssl rand -base64 32)"

# Webhook secret
echo "GITHUB_WEBHOOK_SECRET=$(openssl rand -hex 20)"
```

Paste the values into `.env`.

### 4. Start the app

```bash
docker compose up --build
```

The app is ready when you see:
- `postgres` — `database system is ready to accept connections`
- `backend` — `Server listening on port 3001`
- `frontend` — `Local: http://localhost:5173`

Open **http://localhost:5173** and sign in with GitHub.

---

## Development (hot-reload)

```bash
docker compose up --build
# Compose watch is configured in docker-compose.override.yml
# Changes to src/ in backend or frontend are synced and reloaded automatically
```

---

## GitHub Webhooks (local testing)

Webhooks from GitHub can't reach `localhost` directly. Use **[ngrok](https://ngrok.com)** to expose the backend:

```bash
ngrok http 3001
```

Take the generated URL (e.g. `https://abc123.ngrok.io`) and:

1. Go to your GitHub repo → **Settings → Webhooks → Add webhook**
2. **Payload URL**: `https://abc123.ngrok.io/github/webhook`
3. **Content type**: `application/json`
4. **Secret**: same value as `GITHUB_WEBHOOK_SECRET` in your `.env`
5. **Events**: select **Issues**

---

## Running Tests

```bash
# Backend (Jest)
docker compose exec backend npm test

# Frontend (Vitest)
docker compose exec frontend npm test
```

Or locally (requires Node 20+):

```bash
cd backend && npm install && npm test
cd frontend && npm install && npm test
```

---

## Database Operations

```bash
# Run migrations
docker compose exec backend npm run migrate

# Reset database and reseed
docker compose exec backend npm run db:reset

# Seed sample data
docker compose exec backend npm run seed

# Open Prisma Studio
docker compose exec backend npx prisma studio
```

---

## Project Structure

```
todoapp/
├── docker-compose.yml           # All services: postgres, backend, frontend
├── docker-compose.override.yml  # Dev overrides: volume mounts, hot-reload
├── .env.example                 # Environment variable template
│
├── backend/
│   ├── Dockerfile               # Multi-stage: development / production
│   ├── prisma/
│   │   ├── schema.prisma        # User, Task, GitHubRepo models
│   │   └── seed.ts              # Sample data
│   └── src/
│       ├── server.ts            # Fastify app entry point
│       ├── config.ts            # Zod env validation
│       ├── lib/
│       │   ├── crypto.ts        # AES-256-GCM token encryption
│       │   └── prisma.ts        # Prisma client singleton
│       ├── plugins/
│       │   └── authGuard.ts     # Session cookie auth middleware
│       ├── routes/
│       │   ├── health.ts        # GET /health
│       │   ├── auth.ts          # GitHub OAuth flow
│       │   ├── tasks.ts         # Task CRUD
│       │   └── github.ts        # Repos, import, webhook, sync
│       └── services/
│           ├── taskService.ts   # Prisma task operations
│           └── githubService.ts # Octokit wrapper
│
└── frontend/
    ├── Dockerfile               # Multi-stage: development / production (nginx)
    └── src/
        ├── App.tsx              # Router + ProtectedRoute + AppLayout
        ├── api/client.ts        # Typed fetch wrapper (auto-redirect on 401)
        ├── store/               # Zustand: authStore, taskStore
        ├── hooks/               # useAuth, useTask, useGitHub
        ├── components/
        │   ├── Board/           # Kanban board (@dnd-kit)
        │   ├── TaskCard/        # Task card with sync badge + drag handle
        │   └── TaskForm/        # Create/edit modal with GitHub Issue toggle
        └── pages/
            ├── ListPage.tsx     # Sortable table with filters
            └── SettingsPage.tsx # Connected repos + sync controls
```

---

## API Endpoints

### Auth
| Method | Path              | Description                      |
|--------|-------------------|----------------------------------|
| GET    | `/auth/github`    | Redirect to GitHub OAuth         |
| GET    | `/auth/callback`  | OAuth callback — sets session    |
| GET    | `/auth/me`        | Current user (no token exposed)  |
| POST   | `/auth/logout`    | Clear session cookie             |

### Tasks (all require session cookie)
| Method | Path          | Description                |
|--------|---------------|----------------------------|
| GET    | `/tasks`      | List tasks (filters: status, priority, label) |
| POST   | `/tasks`      | Create task (optional GitHub Issue) |
| GET    | `/tasks/:id`  | Get task by id             |
| PATCH  | `/tasks/:id`  | Update task                |
| DELETE | `/tasks/:id`  | Delete task                |

### GitHub
| Method | Path                             | Description                   |
|--------|----------------------------------|-------------------------------|
| GET    | `/github/repos`                  | List user's GitHub repos      |
| GET    | `/github/connected-repos`        | List connected repos          |
| POST   | `/github/repos`                  | Connect a repo                |
| DELETE | `/github/repos/:id`              | Disconnect a repo             |
| POST   | `/github/repos/:id/import`       | Import open issues as tasks   |
| POST   | `/github/webhook`                | GitHub Issues webhook (public)|
| GET    | `/github/sync`                   | Reconcile out-of-sync tasks   |

---

## Security Notes

- GitHub access tokens are stored **AES-256-GCM encrypted** — never in plaintext
- `userId` is always read from the **signed session cookie** — never from request body
- All inputs validated with **Zod schemas**
- Webhook endpoint verifies **HMAC-SHA256 signature** (`X-Hub-Signature-256`) using `crypto.timingSafeEqual`
- TypeScript **strict mode** — no `any` types
- Cookies are `httpOnly`, `sameSite: lax`, signed

---

## Keyboard Shortcuts

| Shortcut | Action        |
|----------|---------------|
| `N`      | New task      |
| `Escape` | Close modal   |
