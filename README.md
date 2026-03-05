# TodoApp Workshop — Aprenda GitHub Copilot Custom Agents na Prática

> **Nível**: Iniciante a Avançado · **Idioma da documentação educativa**: Português do Brasil

Este projeto é um **workshop educativo** para aprender a criar, organizar e orquestrar **Custom Agents**, **Skills** e **Instructions** do [GitHub Copilot](https://docs.github.com/en/copilot/get-started/what-is-github-copilot). A aplicação TodoApp (task manager full-stack com Kanban board, integração GitHub Issues e Docker Compose) serve como **veículo prático** — o objetivo real é demonstrar como montar um sistema multi-agente com Copilot.

### O que você vai aprender

- Criar **Custom Agents** (`.agent.md`) com personas especializadas
- Criar **Skills** (`SKILL.md`) com conhecimento de domínio reutilizável
- Orquestrar **múltiplos agentes** com handoffs validados e gate final
- Usar **Agent Mode**, **MCP (Model Context Protocol)** e **ferramentas externas**
- Aplicar **boas práticas** de customização do GitHub Copilot

---

## 🤖 O que é GitHub Copilot

O [GitHub Copilot](https://docs.github.com/en/copilot/get-started/what-is-github-copilot) é um assistente de codificação com IA integrado diretamente no editor e no GitHub. Ele vai muito além de autocompletar código — o Copilot pode conversar via chat, executar ações no editor (Agent Mode), integrar ferramentas externas via MCP, e ser customizado com instruções específicas do seu repositório.

Neste workshop, usamos as seguintes capacidades:

| Capacidade | O que faz | Link oficial |
|------------|-----------|--------------|
| **Copilot Chat** | Conversa interativa sobre código no editor | [Docs](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide) |
| **Agent Mode** | Executa ações: editar arquivos, rodar comandos, buscar código | [Docs](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-agent-mode) |
| **Custom Agents** | Agentes personalizados com personas e tools específicas | [Docs](https://docs.github.com/en/copilot/reference/customization-cheat-sheet) |
| **Agent Skills** | Conhecimento de domínio reutilizável em pastas SKILL.md | [Docs](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) |
| **Custom Instructions** | Regras de comportamento do Copilot para o repositório | [Docs](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot) |
| **MCP Servers** | Integrar ferramentas externas (Figma, Azure, bancos de dados) | [Docs](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp) |

---

## 📚 Conceitos Fundamentais

### Custom Agents (`.agent.md`)

**O que é**: Um Custom Agent é um arquivo Markdown (`.agent.md`) que define uma **persona especializada** para o Copilot. Através de um cabeçalho YAML (frontmatter), você declara o nome do agente, uma descrição do que ele faz, e quais ferramentas (tools) ele pode usar. O corpo do arquivo contém as instruções em linguagem natural.

**Para que serve**: Criar especialistas focados em tarefas específicas. Em vez de um Copilot genérico, você tem um "Expert React Frontend Engineer" que só cuida de componentes React, ou um "DevOps Expert" que só mexe em Dockerfiles e CI/CD.

**Como funciona**: O Copilot lê o frontmatter YAML e o corpo Markdown. O campo `description` é usado pelo modelo para decidir **quando** invocar o agente. O campo `tools` restringe quais ferramentas o agente pode acessar.

**Formato do frontmatter**:
```yaml
---
name: 'Nome do Agente'
description: 'Descrição clara do que o agente faz — o modelo usa isso para decidir quando invocá-lo'
tools: ['codebase', 'edit/editFiles', 'execute/runInTerminal', 'search']
---
```

**Exemplo real deste projeto** — [`orchestrator.agent.md`](.github/agents/orchestrator.agent.md):
```yaml
---
name: orchestrator
description: 'Agente orquestrador do TodoApp. Detecta o tipo de tarefa (feature, deploy,
  code-review, bugfix), carrega a skill de workflow correspondente, delega para
  subagentes especializados, valida handoffs entre fases, e garante gate final
  antes de concluir.'
---
```

**Onde fica no projeto**: `.github/agents/*.agent.md`

📖 **Links oficiais**: [Customization Cheat Sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet) · [Creating Agent Skills](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills)

---

### Agent Skills (`SKILL.md`)

**O que é**: Uma Skill é uma pasta contendo um arquivo `SKILL.md` com **conhecimento de domínio** reutilizável — regras, templates, checklists, exemplos de código. A especificação Agent Skills é um [padrão aberto](https://github.com/agentskills/agentskills) usado por diferentes sistemas de IA.

**Para que serve**: Ensinar ao Copilot a realizar tarefas de forma **específica e repetível**. Enquanto o Agent define *quem* faz e *com quais tools*, a Skill define *como* fazer e *quais regras seguir*.

**Diferença entre Agent e Skill**:

| | Custom Agent (`.agent.md`) | Skill (`SKILL.md`) |
|-|---------------------------|---------------------|
| **Define** | Persona + tools + workflow steps | Conhecimento de domínio + regras + templates |
| **Contém** | Instruções de orquestração | Checklists, exemplos, critérios |
| **Localização** | `.github/agents/` | `.github/skills/nome-da-skill/SKILL.md` |
| **Invocação** | Pelo usuário ou por outro agente | Carregada pelo agente quando relevante |

**Onde podem ficar**:
- Projeto: `.github/skills/` ou `.claude/skills/` (dentro do repositório)
- Pessoal: `~/.copilot/skills/` ou `~/.claude/skills/` (compartilhada entre projetos)
- Comunidade: [github/awesome-copilot](https://github.com/github/awesome-copilot) e [anthropics/skills](https://github.com/anthropics/skills)

**Exemplo real deste projeto** — [`workflow-feature/SKILL.md`](.github/skills/workflow-feature/SKILL.md):
```yaml
---
name: workflow-feature
description: 'Workflow de implementação de features para o TodoApp. Define as fases
  Plan → Implement → Review → Verify, critérios de aceite por fase, e quais
  subagentes usar.'
---
```

**Onde fica no projeto**: `.github/skills/*/SKILL.md`

📖 **Links oficiais**: [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) · [Agent Skills Spec](https://github.com/agentskills/agentskills)

---

### Custom Instructions (`.instructions.md`)

**O que é**: Arquivos que fornecem **regras de comportamento padrão** ao Copilot para um repositório. São instruções que se aplicam automaticamente a todas as interações — sem precisar repetir a cada conversa.

**Três tipos de instruções**:

| Tipo | Arquivo | Escopo |
|------|---------|--------|
| **Repo-wide** | `.github/copilot-instructions.md` | Todas as interações no repositório |
| **Path-specific** | `.github/instructions/NOME.instructions.md` | Arquivos que correspondem ao padrão `applyTo` |
| **Agent instructions** | `AGENTS.md` | Instruções para agentes AI (o mais próximo na árvore de diretórios prevalece) |

**Frontmatter para path-specific** (restringe a arquivos específicos via glob):
```yaml
---
applyTo: "**/*.ts,**/*.tsx"
---
```

**Prioridade**: personal > repository > organization. Quando múltiplos tipos existem, todos são fornecidos ao Copilot, mas conflitos devem ser evitados.

> 💡 **Neste projeto**: Temos **4 path-specific instructions** na pasta [`.github/agents/instructions/`](.github/agents/instructions/README.md) — TypeScript, React, Docker e OWASP. Veja a [documentação detalhada](.github/agents/instructions/README.md).

📖 **Link oficial**: [Adding Repository Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

---

### Prompt Files (`.prompt.md`)

**O que é**: Prompts reutilizáveis salvos como arquivos Markdown. São úteis para tarefas recorrentes — em vez de digitar o mesmo prompt toda vez, você referencia o arquivo.

**Para que serve**: Padronizar prompts que a equipe inteira usa. Por exemplo, um prompt para deploy, outro para code review, outro para gerar testes.

> 💡 **Neste projeto**: Temos **3 Prompt Files** na pasta [`.github/prompts/`](.github/prompts/README.md) — build completo, code review e nova feature. Veja a [documentação detalhada](.github/prompts/README.md).

📖 **Link oficial**: [Custom Instructions — Prompt Files](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

---

### Agent Mode vs Ask Mode

**Agent Mode**: O Copilot pode **executar ações** — editar arquivos, rodar comandos no terminal, buscar código, instalar pacotes, rodar testes. É como ter um desenvolvedor par que lê, escreve e executa. Neste workshop, usamos Agent Mode extensivamente para delegar tarefas aos subagentes.

**Ask Mode**: O Copilot apenas **responde perguntas** — explica código, sugere soluções, mas não faz alterações. Útil para entender um codebase ou explorar ideias.

| | Agent Mode | Ask Mode |
|-|------------|----------|
| **Edita arquivos** | ✅ Sim | ❌ Não |
| **Roda comandos** | ✅ Sim | ❌ Não |
| **Usa MCP tools** | ✅ Sim | ❌ Não |
| **Invoca subagentes** | ✅ Sim | ❌ Não |
| **Quando usar** | Implementar, debugar, deployer | Explorar, aprender, planejar |

📖 **Link oficial**: [Using Copilot Agent Mode](https://docs.github.com/en/copilot/using-github-copilot/using-copilot-agent-mode)

---

### MCP — Model Context Protocol

**O que é**: O [MCP](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp) é um protocolo aberto que permite ao Copilot **integrar ferramentas externas** — bancos de dados, APIs, serviços de design, provedores de cloud. Os MCP Servers expõem ferramentas que o Copilot pode chamar durante Agent Mode.

**Para que serve**: Estender o Copilot além do editor. Neste workshop, usamos o **Figma MCP** para gerar os 20 diagramas da documentação diretamente via Copilot.

**Configuração**: Adicione servidores MCP em `.vscode/mcp.json` ou nas settings do VS Code.

**Exemplos de MCP Servers**:
- **Figma MCP** — gerar e ler diagramas no Figma
- **Azure MCP** — gerenciar recursos Azure
- **PostgreSQL MCP** — query e schema de bancos
- **GitHub MCP** — issues, PRs, repositórios

📖 **Link oficial**: [Extending Copilot Chat with MCP](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp)

---

### Orquestração Multi-Agente

**O que é**: Um padrão avançado onde um **agente orquestrador** coordena múltiplos subagentes especializados, delegando tarefas, validando resultados e garantindo qualidade via gates.

**Como funciona neste projeto**: O [`orchestrator.agent.md`](.github/agents/orchestrator.agent.md) segue 5 passos:

1. **Detectar tipo de workflow** — analisa o pedido do usuário (feature? bugfix? deploy? review?)
2. **Carregar a Skill** — lê o `SKILL.md` correspondente para obter as fases e critérios
3. **Executar fases** — delega cada fase para o subagente adequado
4. **Validar handoffs** — checa critérios de saída antes de avançar (max 2 retries)
5. **Gate final** — `tsc --noEmit` + `npm test` + zero `any` types antes de declarar completo

**Regras de handoff**:
- Todos os critérios devem ✅ passar antes de avançar para a próxima fase
- Máximo **2 retries** por fase antes de escalar ao usuário
- **Nunca pular fases** ou gate final

---

## ✅ Boas Práticas

### Padrão Lean Agent + Rich Skill

A melhor prática é separar **orquestração** (agent) de **conhecimento de domínio** (skill):

- O **Agent** define: workflow steps, validações, tools
- A **Skill** contém: regras, templates, checklists, exemplos de código
- O primeiro passo do agent instrui o modelo a **ler o SKILL.md**
- Nunca duplicar conteúdo da skill no corpo do agente

### Estrutura de Arquivos Recomendada

```
.github/
├── agents/                    # Custom Agents
│   ├── orchestrator.agent.md
│   ├── qa.agent.md
│   └── devops-expert.agent.md
├── skills/                    # Agent Skills
│   ├── workflow-feature/
│   │   └── SKILL.md
│   ├── workflow-bugfix/
│   │   └── SKILL.md
│   └── javascript-typescript-jest/
│       └── SKILL.md
├── instructions/              # Path-specific instructions (opcional)
│   └── backend.instructions.md
├── prompts/                   # Prompt files (opcional)
│   └── deploy.prompt.md
└── copilot-instructions.md    # Repo-wide instructions (opcional)
```

### Nomeação Descritiva no Frontmatter

O campo `description` no frontmatter é **crucial** — o modelo usa isso para decidir quando invocar o agente ou skill. Seja específico:

```yaml
# ❌ Ruim — genérico demais
description: 'Ajuda com código'

# ✅ Bom — específico e com keywords
description: 'Agente de code review especializado no TodoApp. Verifica TypeScript
  strict, Zod validation, Prisma usage, React accessibility, segurança OWASP.'
```

### Tools com Escopo Mínimo

Declare apenas as tools que o agente **realmente precisa**. Isso reduz ruído e melhora a precisão:

```yaml
# QA só precisa executar testes e buscar código
tools: ['execute', 'read', 'search', 'edit']

# PostgreSQL DBA precisa de tools de banco específicas
tools: ['pgsql_query', 'pgsql_connect', 'pgsql_visualizeSchema']
```

### Quando Criar Agent vs Skill vs Instruction

| Preciso de... | Usar | Exemplo deste projeto |
|---------------|------|-----------------------|
| Persona especializada com tools | **Custom Agent** (`.agent.md`) | [`devops-expert.agent.md`](.github/agents/devops-expert.agent.md) |
| Conhecimento de domínio reutilizável | **Skill** (`SKILL.md`) | [`workflow-feature/SKILL.md`](.github/skills/workflow-feature/SKILL.md) |
| Regras padrão para todo o repo | **Instructions** (`.instructions.md`) | [`typescript.instructions.md`](.github/agents/instructions/typescript.instructions.md) |
| Prompt reutilizável para tarefas | **Prompt File** (`.prompt.md`) | [`new-feature.prompt.md`](.github/prompts/new-feature.prompt.md) |

---

## 🏗️ O que Este Projeto Demonstra

### 7 Custom Agents

| Agente | Arquivo | Responsabilidade |
|--------|---------|------------------|
| **Orchestrator** | [`orchestrator.agent.md`](.github/agents/orchestrator.agent.md) | Coordena workflows, delega para subagentes, valida handoffs |
| **Expert React Frontend** | [`expert-react-frontend-engineer.agent.md`](.github/agents/expert-react-frontend-engineer.agent.md) | Componentes React 19, hooks, Zustand, TailwindCSS, acessibilidade |
| **PostgreSQL DBA** | [`postgresql-dba.agent.md`](.github/agents/postgresql-dba.agent.md) | Schema Prisma, queries, indexes, migrações |
| **DevOps Expert** | [`devops-expert.agent.md`](.github/agents/devops-expert.agent.md) | Dockerfile, docker-compose, CI/CD, infinity loop DevOps |
| **QA** | [`qa.agent.md`](.github/agents/qa.agent.md) | Testes, bug hunting, edge cases, relatórios de bug |
| **Debug Mode** | [`debug.agent.md`](.github/agents/debug.agent.md) | Investigação de bugs, stack traces, root cause analysis |
| **Code Reviewer** | [`code-reviewer.agent.md`](.github/agents/code-reviewer.agent.md) | Review TypeScript, Zod, Prisma, OWASP, ARIA |

### 8 Skills

| Skill | Arquivo | Tipo | Objetivo |
|-------|---------|------|----------|
| **workflow-feature** | [`SKILL.md`](.github/skills/workflow-feature/SKILL.md) | Workflow | Plan → Implement → Review → Verify |
| **workflow-bugfix** | [`SKILL.md`](.github/skills/workflow-bugfix/SKILL.md) | Workflow | Reproduce → Debug → Fix → Test |
| **workflow-deploy** | [`SKILL.md`](.github/skills/workflow-deploy/SKILL.md) | Workflow | Build → Test → Lint → Verify |
| **workflow-code-review** | [`SKILL.md`](.github/skills/workflow-code-review/SKILL.md) | Workflow | Lint → Security → Review → Approve |
| **conventional-commit** | [`SKILL.md`](.github/skills/conventional-commit/SKILL.md) | Utilidade | Commits padronizados via Conventional Commits |
| **javascript-typescript-jest** | [`SKILL.md`](.github/skills/javascript-typescript-jest/SKILL.md) | Referência | Boas práticas Jest: mocking, async, matchers |
| **multi-stage-dockerfile** | [`SKILL.md`](.github/skills/multi-stage-dockerfile/SKILL.md) | Referência | Dockerfiles multi-stage otimizados |
| **postgresql-code-review** | [`SKILL.md`](.github/skills/postgresql-code-review/SKILL.md) | Referência | JSONB, arrays, schema design, RLS, extensões |

### 4 Workflows com Orquestração

| Workflow | Fases | Subagentes | Gate Final |
|----------|-------|------------|------------|
| **Feature** | Plan → Implement → Review → Verify | React Engineer, DBA, DevOps, Code Reviewer, QA | Code Reviewer aprovou |
| **Bugfix** | Reproduce → Debug → Fix → Test | QA, Debug Mode, (por camada), QA | Teste de regressão criado |
| **Deploy** | Build → Test → Lint → Verify | DevOps Expert, QA | Smoke tests + `.env.example` |
| **Code Review** | Lint → Security → Review → Approve | Code Reviewer | Decisão comunicada |

### Padrão de Orquestração

```
Pedido do usuário
      ↓
[Orchestrator] detecta tipo → carrega SKILL.md
      ↓
[Fase 1] → delega ao subagente → valida critérios ✅ → avança
      ↓
[Fase 2] → delega ao subagente → valida critérios ✅ → avança
      ↓
[Fase N] → delega ao subagente → valida critérios ✅ → avança
      ↓
[Gate Final] → tsc clean + testes passam + zero any
      ↓
Relatório final ao usuário
```

📊 Todos os fluxos estão documentados visualmente nos **[20 diagramas](#-arquitetura--diagramas)** da pasta `diagramas/`.

### 📂 Documentação Detalhada por Diretório

Cada diretório do projeto tem seu próprio README com explicações aprofundadas:

| Diretório | README | Conteúdo |
|-----------|--------|----------|
| [`.github/`](.github/README.md) | Visão geral | Estrutura completa da customização Copilot |
| [`.github/agents/`](.github/agents/README.md) | Custom Agents | 7 agentes com frontmatter, tools e delegação |
| [`.github/agents/instructions/`](.github/agents/instructions/README.md) | Instructions | 4 instruções com `applyTo`, globs e prioridade |
| [`.github/skills/`](.github/skills/README.md) | Agent Skills | 8 skills (workflows + referência), padrão Lean Agent |
| [`.github/prompts/`](.github/prompts/README.md) | Prompt Files | 3 prompts reutilizáveis (build, review, feature) |
| [`backend/`](backend/README.md) | Backend API | Fastify + Prisma, padrões Routes→Services→Prisma |
| [`backend/src/`](backend/src/README.md) | Código Backend | Fluxo de requisição, arquivos-chave, segurança |
| [`frontend/`](frontend/README.md) | Frontend SPA | React + Zustand + TailwindCSS, rotas e scripts |
| [`frontend/src/`](frontend/src/README.md) | Código Frontend | Fluxo de dados, store, hooks, tipos |
| [`diagramas/`](diagramas/README.md) | Diagramas | 20 diagramas catalogados com paleta de cores |

---

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

---

## 📊 Arquitetura & Diagramas

Diagramas educativos e didáticos documentando a arquitetura da aplicação, o sistema de agentes AI, workflows e skills — todos em Português do Brasil.

### Arquitetura & Orchestrador

| Diagrama | Descrição |
|----------|-----------|
| [![Arquitetura Geral](diagramas/TodoApp%20-%20Arquitetura%20Geral.jpg)](diagramas/TodoApp%20-%20Arquitetura%20Geral.jpg) | **Arquitetura Geral** — Visão macro: Usuário → Frontend (React+Vite, :5173) → Backend (Fastify, :3001) → PostgreSQL (Prisma, :5432) dentro do Docker Compose |
| [![Orchestrador](diagramas/Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg)](diagramas/Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg) | **Orchestrador & Handoffs** — Fluxo completo: Detectar Tipo → Carregar Skill → Executar Fases → Validar Handoff → Gate Final → Relatório |

### Workflows (4)

| Diagrama | Descrição |
|----------|-----------|
| [![Workflow Feature](diagramas/Workflow%20Feature%20-%20Plan%20Implement%20Review%20Verify.jpg)](diagramas/Workflow%20Feature%20-%20Plan%20Implement%20Review%20Verify.jpg) | **Feature** — Plan → Implement → Review → Verify |
| [![Workflow Bugfix](diagramas/Workflow%20Bugfix%20-%20Reproduce%20Debug%20Fix%20Test.jpg)](diagramas/Workflow%20Bugfix%20-%20Reproduce%20Debug%20Fix%20Test.jpg) | **Bugfix** — Reproduce → Debug → Fix → Test |
| [![Workflow Deploy](diagramas/Workflow%20Deploy%20-%20Build%20Test%20Lint%20Verify.jpg)](diagramas/Workflow%20Deploy%20-%20Build%20Test%20Lint%20Verify.jpg) | **Deploy** — Build → Test → Lint → Verify |
| [![Workflow Code Review](diagramas/Workflow%20Code%20Review%20-%20Lint%20Security%20Review%20Approve.jpg)](diagramas/Workflow%20Code%20Review%20-%20Lint%20Security%20Review%20Approve.jpg) | **Code Review** — Lint → Security → Review → Approve |

### Agentes (6)

| Diagrama | Descrição |
|----------|-----------|
| [![React Frontend](diagramas/Agente%20-%20Expert%20React%20Frontend%20Engineer.jpg)](diagramas/Agente%20-%20Expert%20React%20Frontend%20Engineer.jpg) | **Expert React Frontend Engineer** — React 19, hooks, Zustand, TailwindCSS, acessibilidade |
| [![PostgreSQL DBA](diagramas/Agente%20-%20PostgreSQL%20Database%20Administrator.jpg)](diagramas/Agente%20-%20PostgreSQL%20Database%20Administrator.jpg) | **PostgreSQL DBA** — Schema Prisma, queries, indexes, migrações |
| [![DevOps Expert](diagramas/Agente%20-%20DevOps%20Expert.jpg)](diagramas/Agente%20-%20DevOps%20Expert.jpg) | **DevOps Expert** — Infinity Loop, Dockerfile, docker-compose, CI/CD |
| [![QA](diagramas/Agente%20-%20QA%20Quality%20Assurance.jpg)](diagramas/Agente%20-%20QA%20Quality%20Assurance.jpg) | **QA** — Testes, bug hunting, edge cases, relatórios |
| [![Debug Mode](diagramas/Agente%20-%20Debug%20Mode%20Instructions.jpg)](diagramas/Agente%20-%20Debug%20Mode%20Instructions.jpg) | **Debug Mode** — 4 fases: Assessment → Investigation → Resolution → QA |
| [![Code Reviewer](diagramas/Agente%20-%20Code%20Reviewer%20TodoApp.jpg)](diagramas/Agente%20-%20Code%20Reviewer%20TodoApp.jpg) | **Code Reviewer** — Checklists por camada: Backend, Frontend, Security, Database |

### Skills (8)

| Diagrama | Descrição |
|----------|-----------|
| [![workflow-feature](diagramas/SKILL%20-%20workflow-feature%20detalhado.jpg)](diagramas/SKILL%20-%20workflow-feature%20detalhado.jpg) | **workflow-feature** — Plan → Implement → Review → Verify com critérios e gate final |
| [![workflow-bugfix](diagramas/SKILL%20-%20workflow-bugfix%20detalhado.jpg)](diagramas/SKILL%20-%20workflow-bugfix%20detalhado.jpg) | **workflow-bugfix** — Reproduce → Debug → Fix → Test com teste de regressão obrigatório |
| [![workflow-deploy](diagramas/SKILL%20-%20workflow-deploy%20detalhado.jpg)](diagramas/SKILL%20-%20workflow-deploy%20detalhado.jpg) | **workflow-deploy** — Build → Test → Lint → Verify com smoke tests |
| [![workflow-code-review](diagramas/SKILL%20-%20workflow-code-review%20detalhado.jpg)](diagramas/SKILL%20-%20workflow-code-review%20detalhado.jpg) | **workflow-code-review** — Lint → Security OWASP → Review → Approve |
| [![conventional-commit](diagramas/SKILL%20-%20conventional-commit.jpg)](diagramas/SKILL%20-%20conventional-commit.jpg) | **conventional-commit** — Fluxo: git status → diff → stage → XML → commit |
| [![jest](diagramas/SKILL%20-%20JavaScript%20TypeScript%20Jest.jpg)](diagramas/SKILL%20-%20JavaScript%20TypeScript%20Jest.jpg) | **JavaScript TypeScript Jest** — Estrutura, mocking, async, snapshots, matchers |
| [![multi-stage-dockerfile](diagramas/SKILL%20-%20multi-stage-dockerfile.jpg)](diagramas/SKILL%20-%20multi-stage-dockerfile.jpg) | **multi-stage-dockerfile** — Builder → Runtime, layers, segurança, performance |
| [![postgresql-code-review](diagramas/SKILL%20-%20postgresql-code-review.jpg)](diagramas/SKILL%20-%20postgresql-code-review.jpg) | **postgresql-code-review** — JSONB, arrays, schema design, tipos, RLS, extensões |
