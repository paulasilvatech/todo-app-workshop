# `src/` — Código-fonte do Backend

Código-fonte principal da API REST. Segue o padrão **Routes → Services → Prisma** com validação Zod e TypeScript strict.

## Estrutura

```
src/
├── server.ts          # Entry point — registra plugins, middleware e rotas
├── config.ts          # Validação de variáveis de ambiente com Zod schema
├── lib/               # Utilitários compartilhados
│   ├── crypto.ts      # Encriptação AES-256-GCM para tokens GitHub
│   └── prisma.ts      # Singleton do Prisma Client
├── plugins/           # Plugins Fastify
│   └── authGuard.ts   # Middleware de autenticação via cookie assinado
├── routes/            # Endpoints HTTP (cada arquivo = grupo de rotas)
│   ├── health.ts      # GET /health — healthcheck
│   ├── auth.ts        # GET /auth/github, /auth/callback, /auth/me, POST /auth/logout
│   ├── tasks.ts       # CRUD de tasks (GET, POST, PATCH, DELETE /tasks)
│   └── github.ts      # Repos, import, webhook, sync (/github/*)
├── services/          # Lógica de negócio separada das rotas
│   ├── taskService.ts   # Operações CRUD de tasks via Prisma
│   └── githubService.ts # Wrapper do Octokit (GitHub API)
└── __tests__/         # Testes unitários Jest
    ├── envSetup.ts              # Setup de variáveis de ambiente para testes
    ├── tasks.route.test.ts      # Testes das rotas de tasks
    ├── taskService.test.ts      # Testes do serviço de tasks
    ├── githubService.test.ts    # Testes do serviço GitHub
    ├── crypto.test.ts           # Testes de encriptação/decriptação
    └── webhook.test.ts          # Testes de validação de webhook HMAC
```

## Fluxo de uma requisição

```
Cliente HTTP
    ↓
[server.ts] → registra CORS, cookies, content parser
    ↓
[authGuard.ts] → verifica cookie de sessão (exceto rotas públicas)
    ↓
[routes/*.ts] → valida input com Zod → chama service
    ↓
[services/*.ts] → lógica de negócio → chama Prisma
    ↓
[lib/prisma.ts] → query SQL parametrizada → PostgreSQL
    ↓
Response JSON ao cliente
```

## Arquivos-chave

### `server.ts` — Entry Point

Registra na ordem:
1. **CORS** — permite apenas `FRONTEND_URL`
2. **Cookie** — plugin com secret para assinar cookies
3. **Content Parser** — captura raw body para verificação HMAC de webhooks
4. **Rotas públicas** — health, auth, github (antes do authGuard)
5. **authGuard** — middleware de autenticação (após rotas públicas)
6. **Rotas protegidas** — tasks (após authGuard)

### `config.ts` — Validação de Ambiente

Usa Zod para validar **todas** as variáveis de ambiente na inicialização. Se alguma estiver faltando ou inválida, o servidor **não inicia** — fail fast.

### `lib/crypto.ts` — Encriptação de Tokens

Tokens GitHub são armazenados encriptados com **AES-256-GCM**:
- `encrypt(plaintext)` → retorna `iv:authTag:ciphertext` em base64
- `decrypt(encrypted)` → retorna o token original
- Chave: `TOKEN_ENCRYPTION_KEY` (64 hex chars = 32 bytes)

### `plugins/authGuard.ts` — Autenticação

- Verifica cookie `session` (assinado com `SESSION_SECRET`)
- Busca usuário no banco via `prisma.user.findUnique`
- Injeta `request.user` para rotas protegidas
- **Modo sem auth**: quando GitHub OAuth não configurado, auto-atribui `demo-user`

## Navegação

- ⬆️ [Voltar ao README backend/](../README.md)
- ⬆️⬆️ [Voltar ao README principal](../../README.md)
- 🎨 [Frontend src/](../../frontend/src/README.md) — código do frontend que consome esta API
- 🤖 [Agents](../../.github/agents/README.md) — agentes AI especializados
