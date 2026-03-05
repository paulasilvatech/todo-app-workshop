# `backend/` — API REST com Fastify + TypeScript + Prisma

O backend é uma **API REST** construída com [Fastify](https://fastify.io), [TypeScript](https://www.typescriptlang.org) e [Prisma ORM](https://www.prisma.io). Roda em um container Docker com Node.js 20 Alpine.

## Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Node.js** | 20 Alpine | Runtime |
| **Fastify** | 4.x | Framework HTTP (alta performance) |
| **TypeScript** | 5.x | Tipagem estática (strict mode) |
| **Prisma** | 5.x | ORM para PostgreSQL |
| **Zod** | 3.x | Validação de inputs |
| **Jest** | 29.x | Framework de testes |
| **@octokit/rest** | 20.x | Cliente GitHub API |

## Estrutura de diretórios

```
backend/
├── Dockerfile               # Multi-stage: development / builder / production
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração TypeScript (strict: true)
├── jest.setup.js            # Setup global do Jest
├── prisma/
│   ├── schema.prisma        # Modelos: User, Task, GitHubRepo + enums
│   └── seed.ts              # Dados de exemplo (demo-user + 10 tasks)
└── src/
    ├── server.ts            # Entry point: registra plugins e rotas
    ├── config.ts            # Validação de env vars com Zod
    ├── lib/                 # Utilitários compartilhados
    ├── plugins/             # Plugins Fastify (authGuard)
    ├── routes/              # Endpoints HTTP
    ├── services/            # Lógica de negócio
    └── __tests__/           # Testes unitários Jest
```

## Padrões arquiteturais

### Separação Routes → Services → Prisma

```
Route Handler (routes/*.ts)
    ↓ valida input com Zod
Service (services/*.ts)
    ↓ lógica de negócio
Prisma Client (lib/prisma.ts)
    ↓ query SQL parametrizada
PostgreSQL
```

- **Route**: recebe request, valida com Zod, chama service, retorna response
- **Service**: contém a lógica de negócio, usa Prisma para acessar o banco
- **Prisma**: ORM que gera queries SQL seguras (sem raw SQL)

### Padrão de erro

Todos os erros seguem o formato:
```json
{ "error": "Mensagem legível", "code": "CODIGO_MAQUINA" }
```

Exemplos: `AUTH_REQUIRED`, `VALIDATION_ERROR`, `NOT_FOUND`, `USER_NOT_FOUND`

### Autenticação

- `authGuard.ts` — plugin Fastify que verifica cookie de sessão assinado
- `request.user` — sempre lido do cookie, **nunca** do body
- Rotas públicas: `/health`, `/auth/*`, `/github/webhook`
- Modo sem auth: quando GitHub OAuth não está configurado, usa `demo-user` automaticamente

### Segurança

- **AES-256-GCM** para encriptar tokens GitHub (`lib/crypto.ts`)
- **HMAC-SHA256** com `crypto.timingSafeEqual` para validar webhooks
- **Zod schemas** em toda entrada de rota
- **Cookies**: `httpOnly`, `sameSite: lax`, assinados
- **CORS**: apenas `FRONTEND_URL`

## Scripts disponíveis

```bash
npm run dev          # Inicia servidor com tsx watch (hot-reload)
npm run build        # Compila TypeScript para dist/
npm test             # Roda testes Jest
npm run migrate      # Roda Prisma migrations
npm run seed         # Seed do banco com dados de exemplo
npm run db:reset     # Reset completo + reseed
```

## Dockerfile

Multi-stage com 3 targets:
- **development** — usado no docker-compose (com hot-reload via volume mount)
- **builder** — compila TypeScript e gera Prisma client
- **production** — imagem mínima com apenas `dist/` e `node_modules` de produção

## Diagrama: Arquitetura Geral

[![Arquitetura Geral](../diagramas/TodoApp%20-%20Arquitetura%20Geral.jpg)](../diagramas/TodoApp%20-%20Arquitetura%20Geral.jpg)

> Visão macro: Usuário → Frontend (:5173) → **Backend (:3001)** → PostgreSQL (:5432) dentro do Docker Compose

## Navegação

- ⬆️ [Voltar ao README principal](../README.md)
- 📂 [Código-fonte (src/)](src/README.md) — arquitetura interna detalhada
- 🎨 [Frontend](../frontend/README.md) — interface React que consome esta API
- 📊 [Diagramas](../diagramas/README.md) — arquitetura visual do projeto
- 🤖 [Agents](../.github/agents/README.md) — agentes AI que trabalham neste código
