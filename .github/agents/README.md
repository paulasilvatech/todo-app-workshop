# `agents/` — Custom Agents do GitHub Copilot

Custom Agents são **personas especializadas** que o GitHub Copilot assume para realizar tarefas específicas. Cada arquivo `.agent.md` define um agente com nome, descrição, ferramentas (tools) e instruções em linguagem natural.

📖 **Link oficial**: [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) · [Customization Cheat Sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)

## Como funciona um `.agent.md`

Todo arquivo de agente tem duas partes:

### 1. Frontmatter YAML (cabeçalho)

```yaml
---
name: 'Nome do Agente'
description: 'Descrição clara — o modelo usa isso para decidir quando invocar'
tools: ['codebase', 'edit/editFiles', 'execute/runInTerminal']
---
```

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `name` | ✅ | Nome exibido ao usuário (ex: `QA`, `DevOps Expert`) |
| `description` | ✅ | Texto que o Copilot usa para decidir **quando** ativar o agente |
| `tools` | ❌ | Lista de ferramentas que o agente pode usar. Se omitido, usa todas |

### 2. Corpo Markdown (instruções)

O corpo contém as instruções em linguagem natural. Pode incluir:
- Persona e missão do agente
- Princípios e regras de comportamento
- Fluxo de trabalho (fases, steps)
- Checklists e critérios de qualidade

## Agentes deste projeto

| Agente | Arquivo | Tipo | Responsabilidade |
|--------|---------|------|------------------|
| **Orchestrator** | [`orchestrator.agent.md`](orchestrator.agent.md) | Orquestrador | Coordena todos os workflows, delega para subagentes, valida handoffs |
| **Expert React Frontend** | [`expert-react-frontend-engineer.agent.md`](expert-react-frontend-engineer.agent.md) | Especialista | React 19, hooks, Zustand, TailwindCSS, acessibilidade WCAG |
| **PostgreSQL DBA** | [`postgresql-dba.agent.md`](postgresql-dba.agent.md) | Especialista | Schema Prisma, queries, indexes, migrações, performance |
| **DevOps Expert** | [`devops-expert.agent.md`](devops-expert.agent.md) | Especialista | Dockerfile, docker-compose, CI/CD, DevOps infinity loop |
| **QA** | [`qa.agent.md`](qa.agent.md) | Especialista | Testes, bug hunting, edge cases, relatórios de bug |
| **Debug Mode** | [`debug.agent.md`](debug.agent.md) | Especialista | Investigação de bugs, stack traces, root cause analysis |
| **Code Reviewer** | [`code-reviewer.agent.md`](code-reviewer.agent.md) | Especialista | Review TypeScript, Zod, Prisma, OWASP, ARIA |

## Como o Orchestrator delega

O `orchestrator.agent.md` é o agente central. Ele:

1. **Detecta o tipo** da tarefa (feature, bugfix, deploy, code review)
2. **Carrega a skill** correspondente (`.github/skills/workflow-*/SKILL.md`)
3. **Delega fases** para subagentes especializados
4. **Valida handoffs** — critérios de saída antes de avançar
5. **Aplica gate final** — `tsc --noEmit` + `npm test` + zero `any`

```
Usuário: "adicionar filtro por label"
    ↓
Orchestrator → detecta: "feature"
    ↓ carrega
workflow-feature/SKILL.md
    ↓ delega
Fase Plan: orchestrator direto
Fase Implement: Expert React Frontend Engineer
Fase Review: Code Reviewer
Fase Verify: QA
    ↓
Gate Final: tsc + testes + code reviewer aprovou
```

## Subpasta: `instructions/`

Dentro de `agents/` há a pasta [`instructions/`](instructions/) com **Custom Instructions** — regras automáticas aplicadas por tipo de arquivo. Consulte o [README da pasta instructions](instructions/README.md).

## Boas práticas para criar agentes

1. **Description descritiva** — inclua keywords que o modelo usará para selecionar o agente
2. **Tools com escopo mínimo** — declare apenas as tools necessárias
3. **Lean Agent** — coloque regras de domínio em Skills, não no corpo do agente
4. **Persona clara** — defina quem o agente "é" e quais são seus princípios
5. **Fluxo de trabalho** — descreva as fases e o que o agente deve fazer em cada uma

## Diagramas dos Agentes

| Agente | Diagrama |
|--------|----------|
| **Orchestrador** | [![Orchestrador](../../diagramas/Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg)](../../diagramas/Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg) |
| **React Frontend** | [![React Frontend](../../diagramas/Agente%20-%20Expert%20React%20Frontend%20Engineer.jpg)](../../diagramas/Agente%20-%20Expert%20React%20Frontend%20Engineer.jpg) |
| **PostgreSQL DBA** | [![PostgreSQL DBA](../../diagramas/Agente%20-%20PostgreSQL%20Database%20Administrator.jpg)](../../diagramas/Agente%20-%20PostgreSQL%20Database%20Administrator.jpg) |
| **DevOps Expert** | [![DevOps Expert](../../diagramas/Agente%20-%20DevOps%20Expert.jpg)](../../diagramas/Agente%20-%20DevOps%20Expert.jpg) |
| **QA** | [![QA](../../diagramas/Agente%20-%20QA%20Quality%20Assurance.jpg)](../../diagramas/Agente%20-%20QA%20Quality%20Assurance.jpg) |
| **Debug Mode** | [![Debug Mode](../../diagramas/Agente%20-%20Debug%20Mode%20Instructions.jpg)](../../diagramas/Agente%20-%20Debug%20Mode%20Instructions.jpg) |
| **Code Reviewer** | [![Code Reviewer](../../diagramas/Agente%20-%20Code%20Reviewer%20TodoApp.jpg)](../../diagramas/Agente%20-%20Code%20Reviewer%20TodoApp.jpg) |

## Navegação

- ⬆️ [Voltar ao README .github/](../README.md)
- ⬆️⬆️ [Voltar ao README principal](../../README.md)
- 📋 [Instructions](instructions/README.md) — regras automáticas por tipo de arquivo
- 🛠️ [Skills](../skills/README.md) — conhecimento de domínio carregado pelos agentes
- 💬 [Prompts](../prompts/README.md) — prompts reutilizáveis que invocam os agentes
