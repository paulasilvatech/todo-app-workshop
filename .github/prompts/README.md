# `prompts/` — Prompt Files do GitHub Copilot

Prompt Files são **prompts reutilizáveis** salvos como arquivos Markdown (`.prompt.md`). Em vez de digitar o mesmo prompt toda vez, você referencia o arquivo e o Copilot executa as instruções contidas nele.

📖 **Link oficial**: [Custom Instructions — Prompt Files](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

## Como funciona

Cada arquivo `.prompt.md` tem:

### 1. Frontmatter YAML

```yaml
---
mode: agent           # 'agent' para executar ações, 'ask' para apenas responder
description: 'Descrição do que o prompt faz'
---
```

| Campo | Valores | Descrição |
|-------|---------|-----------|
| `mode` | `agent` ou `ask` | Define se o Copilot pode executar ações ou só responder |
| `description` | Texto livre | Exibido na lista de prompts disponíveis |

### 2. Corpo Markdown

Contém o prompt completo com instruções, contexto e exemplos.

## Prompts deste projeto

| Prompt | Arquivo | Modo | Descrição |
|--------|---------|------|-----------|
| **Build TodoApp** | [`build-todoapp.prompt.md`](build-todoapp.prompt.md) | `agent` | Construir o TodoApp completo do zero: stack, schema, rotas, componentes |
| **Code Review** | [`code-review.prompt.md`](code-review.prompt.md) | `agent` | Executar code review via orchestrator: Lint → Security → Review → Approve |
| **Nova Feature** | [`new-feature.prompt.md`](new-feature.prompt.md) | `agent` | Adicionar feature via orchestrator: Plan → Implement → Review → Verify |

## Como usar

No VS Code, você pode invocar um prompt file de duas formas:

1. **Copilot Chat**: Referencie o arquivo no chat
2. **Command Palette**: Busque "Copilot: Run Prompt"

### Exemplo de uso

O prompt `new-feature.prompt.md` instrui o Copilot a usar o agente `@orchestrator` para seguir o workflow completo de feature:

```
Use o agente @orchestrator para executar o workflow de feature completo.

Descreva a feature: "Adicionar filtro por label na lista de tasks"
```

O orchestrator então:
1. Carrega `workflow-feature/SKILL.md`
2. Executa Plan → Implement → Review → Verify
3. Delega cada fase para o subagente adequado
4. Valida handoffs e gate final

## Diferença entre Prompt e Instruction

| Aspecto | Prompt File (`.prompt.md`) | Instruction (`.instructions.md`) |
|---------|---------------------------|----------------------------------|
| **Ativação** | Manual — o usuário escolhe executar | Automática — aplicada por `applyTo` |
| **Propósito** | Tarefa específica e pontual | Regras gerais sempre ativas |
| **Modo** | `agent` ou `ask` | Sempre contextual (sem modo) |
| **Exemplo** | "Faça deploy completo" | "Sempre use TypeScript strict" |

## Boas práticas para criar prompts

1. **Modo `agent` para ações** — quando o prompt precisa editar, executar ou criar
2. **Description clara** — aparece na lista de prompts para o usuário escolher
3. **Contexto do projeto** — inclua stack, convenções e caminhos relevantes
4. **Referencie agentes** — use `@nome-do-agente` para invocar agentes especializados
5. **Um prompt por tarefa** — não misture build + deploy + review no mesmo prompt

## Diagramas dos Workflows Invocados

Os prompts `code-review` e `new-feature` ativam workflows via orchestrador. Veja os fluxos completos:

| Prompt | Workflow ativado | Diagrama |
|--------|-----------------|----------|
| `new-feature.prompt.md` | Feature | [![Feature](../../diagramas/Workflow%20Feature%20-%20Plan%20Implement%20Review%20Verify.jpg)](../../diagramas/Workflow%20Feature%20-%20Plan%20Implement%20Review%20Verify.jpg) |
| `code-review.prompt.md` | Code Review | [![Code Review](../../diagramas/Workflow%20Code%20Review%20-%20Lint%20Security%20Review%20Approve.jpg)](../../diagramas/Workflow%20Code%20Review%20-%20Lint%20Security%20Review%20Approve.jpg) |
| `build-todoapp.prompt.md` | Deploy | [![Deploy](../../diagramas/Workflow%20Deploy%20-%20Build%20Test%20Lint%20Verify.jpg)](../../diagramas/Workflow%20Deploy%20-%20Build%20Test%20Lint%20Verify.jpg) |

## Navegação

- ⬆️ [Voltar ao README .github/](../README.md)
- ⬆️⬆️ [Voltar ao README principal](../../README.md)
- 🤖 [Agents](../agents/README.md) — agentes invocados pelos prompts
- 🛠️ [Skills](../skills/README.md) — workflows que os prompts ativam
- 📋 [Instructions](../agents/instructions/README.md) — regras automáticas aplicadas junto
