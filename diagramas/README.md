# `diagramas/` — Documentação Visual da Arquitetura

Esta pasta contém **31 diagramas educativos** gerados via [Figma MCP](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp) diretamente pelo GitHub Copilot no Agent Mode. Todos em Português do Brasil com legendas detalhadas.

## Como foram criados

Os diagramas foram gerados usando o **MCP (Model Context Protocol)** do Figma integrado ao VS Code. O Copilot em Agent Mode leu os arquivos `.agent.md` e `SKILL.md` do projeto e gerou diagramas Mermaid que o Figma converteu em imagens visuais.

Isso demonstra o poder do MCP — integrar ferramentas externas (Figma) diretamente no fluxo de trabalho do Copilot.

## Inventário completo

### Arquitetura & Orchestrador (2)

| Arquivo | Descrição |
|---------|-----------|
| `TodoApp - Arquitetura Geral.jpg` | Visão macro: Usuário → Frontend (:5173) → Backend (:3001) → PostgreSQL (:5432) no Docker Compose |
| `Orchestrador - Fluxo de Handoffs entre Agentes.jpg` | Fluxo completo: Detectar Tipo → Carregar Skill → Fases → Handoff → Gate Final |

### Workflows (4)

| Arquivo | Descrição |
|---------|-----------|
| `Workflow Feature - Plan Implement Review Verify.jpg` | Feature: Plan → Implement → Review → Verify com subagentes |
| `Workflow Bugfix - Reproduce Debug Fix Test.jpg` | Bugfix: Reproduce → Debug → Fix → Test com teste de regressão |
| `Workflow Deploy - Build Test Lint Verify.jpg` | Deploy: Build → Test → Lint → Verify com smoke tests |
| `Workflow Code Review - Lint Security Review Approve.jpg` | Code Review: Lint → Security OWASP → Review → Approve |

### Agentes (6)

| Arquivo | Descrição |
|---------|-----------|
| `Agente - Expert React Frontend Engineer.jpg` | React 19, hooks, Zustand, TailwindCSS, acessibilidade |
| `Agente - PostgreSQL Database Administrator.jpg` | Schema Prisma, queries, indexes, migrações |
| `Agente - DevOps Expert.jpg` | Infinity Loop DevOps, Dockerfile, CI/CD |
| `Agente - QA Quality Assurance.jpg` | 5 etapas de QA, categorias de teste, bug report |
| `Agente - Debug Mode Instructions.jpg` | 4 fases: Assessment → Investigation → Resolution → QA |
| `Agente - Code Reviewer TodoApp.jpg` | Checklists por camada: Backend, Frontend, Security, Database |

### Skills (8)

| Arquivo | Descrição |
|---------|-----------|
| `SKILL - workflow-feature detalhado.jpg` | Plan → Implement → Review → Verify com critérios e gate |
| `SKILL - workflow-bugfix detalhado.jpg` | Reproduce → Debug → Fix → Test com regressão obrigatória |
| `SKILL - workflow-deploy detalhado.jpg` | Build → Test → Lint → Verify com smoke tests |
| `SKILL - workflow-code-review detalhado.jpg` | Lint → Security OWASP → Review → Approve |
| `SKILL - conventional-commit.jpg` | Fluxo: git status → diff → stage → XML → commit |
| `SKILL - JavaScript TypeScript Jest.jpg` | Estrutura, mocking, async, snapshots, matchers |
| `SKILL - multi-stage-dockerfile.jpg` | Builder → Runtime, layers, segurança, performance |
| `SKILL - postgresql-code-review.jpg` | JSONB, arrays, schema design, tipos, RLS, extensões |
### Conceitos & Boas Práticas (11)

| Arquivo | Descrição |
|---------|----------|
| `Arvore de Decisao_ Quando Usar Agente Customizado vs Generalista vs Skill.jpg` | Árvore de decisão: quando criar Agent vs Skill vs usar o padrão |
| `Ciclo Completo Skills.png` | Ciclo de vida completo das Skills: criação → uso → evolução |
| `Fluxo de Orquestracao_ Agents + Skills — Como Funciona.jpg` | Fluxo detalhado de como Agents carregam e usam Skills |
| `Handoff Entre Agentes_ Como o Trabalho Flui de Agente para Agente.jpg` | Handoff entre agentes: critérios de saída, retries, escalonamento |
| `Hooks_ O Que Sao, Quando Disparam e Como Funcionam.jpg` | Hooks: o que são, eventos que disparam, ciclo de vida |
| `Integracao de Prompts_ As 6 Camadas que Formam o Contexto Final.jpg` | 6 camadas de contexto: personal → org → repo → path → agent → prompt |
| `Mapa de Referencia_ Arquivos do Ecossistema de Agents e Skills.jpg` | Mapa completo: todos os arquivos do ecossistema Copilot |
| `Modernizacao de Legacy Code_ Workflow em 5 Fases + Boas Praticas.jpg` | Workflow de modernização: 5 fases com boas práticas |
| `Modernizando Legacy Code.png` | Visão geral do processo de modernização de código legado |
| `Revisao de Codigo Gerado por AI.png` | Checklist de revisão para código gerado por IA |
## Paleta de cores usada

| Camada | Cor | Hex |
|--------|-----|-----|
| Frontend | Azul | `#3B82F6` |
| Backend | Verde | `#10B981` |
| Database | Amarelo | `#F59E0B` |
| Infraestrutura | Roxo | `#8B5CF6` |
| Orchestrador | Vermelho | `#EF4444` |
| Skills | Rosa | `#EC4899` |

## Navegação

- ⬆️ [Voltar ao README principal](../README.md)
- 🤖 [Agents](../.github/agents/README.md) — agentes documentados nos diagramas
- 🛠️ [Skills](../.github/skills/README.md) — skills documentadas nos diagramas
- 🔧 [Backend](../backend/README.md) — backend da aplicação
- 🎨 [Frontend](../frontend/README.md) — frontend da aplicação
