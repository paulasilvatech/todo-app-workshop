---
mode: agent
description: 'Build completo do TodoApp: Task manager full-stack com GitHub Issues integration, PostgreSQL, React, Docker'
---

# Build: TodoApp com GitHub Issues Integration

## Stack (não negociável)

| Camada   | Tecnologia                              |
|----------|-----------------------------------------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend  | Node.js 20 + Fastify + TypeScript       |
| ORM      | Prisma (com migrations)                 |
| Database | PostgreSQL 16                           |
| Auth     | GitHub OAuth (via OAuth App)            |
| GitHub   | Octokit REST (`@octokit/rest`)          |
| Containers | Docker + Docker Compose               |
| Testes   | Vitest (frontend) + Jest (backend)      |

## Funcionalidades

### Task Management
- CRUD de tasks com: title, description, status, priority, due_date, labels[], assignee
- Kanban board com drag-and-drop (@dnd-kit)
- List view com filtros e ordenação

### GitHub Issues Integration
- Two-way sync: task ↔ GitHub Issue
- Importar Issues de repositórios conectados
- Webhook para receber eventos do GitHub
- Sync status: SYNCED / OUT_OF_SYNC / LOCAL_ONLY

### Auth & Security
- GitHub OAuth login/logout
- Tokens encriptados AES-256-GCM
- Session cookies HttpOnly + signed
- Webhook HMAC-SHA256 verificado

## Como executar

```bash
docker compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

## Fases de implementação

1. Infraestrutura (Docker, configs)
2. Backend Foundation (Fastify, Prisma, crypto)
3. Autenticação (GitHub OAuth)
4. Task API (CRUD + Zod)
5. GitHub Integration (Octokit, webhook)
6. Frontend (React, Zustand, dnd-kit)
7. Testes (Jest + Vitest)
