# `skills/` — Agent Skills do GitHub Copilot

Agent Skills são pastas com **conhecimento de domínio reutilizável** que o Copilot carrega quando relevante para melhorar sua performance em tarefas especializadas. A especificação Agent Skills é um [padrão aberto](https://github.com/agentskills/agentskills).

📖 **Link oficial**: [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) · [Creating Agent Skills](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/create-skills)

## Estrutura de uma Skill

Cada skill é uma **pasta** com pelo menos um arquivo `SKILL.md`:

```
.github/skills/
└── nome-da-skill/
    └── SKILL.md      # Instruções, regras, checklists, exemplos
```

### Frontmatter do SKILL.md

```yaml
---
name: nome-da-skill
description: 'Descrição clara do que a skill faz — o modelo usa para decidir quando carregá-la'
---
```

## Diferença: Skill vs Agent

| Aspecto | Agent (`.agent.md`) | Skill (`SKILL.md`) |
|---------|--------------------|--------------------|
| **Define** | Persona + tools + workflow | Conhecimento + regras + checklists |
| **Contém** | "Quem faz" e "com quais ferramentas" | "Como fazer" e "quais regras seguir" |
| **Invocação** | Pelo usuário ou outro agente | Carregada automaticamente quando relevante |
| **Localização** | `.github/agents/` | `.github/skills/nome/SKILL.md` |

### Padrão Lean Agent + Rich Skill

A **boa prática** é separar:
- **Agent**: orquestração (steps, tools, validações) — mantém o arquivo leve
- **Skill**: domínio (regras, templates, exemplos) — contém todo o conhecimento

O primeiro passo do agent deve ser **ler o SKILL.md** correspondente.

## Skills deste projeto

### Workflows (4 skills)

Skills que definem fluxos sequenciais com fases, critérios de saída e gates:

| Skill | Fases | Descrição |
|-------|-------|-----------|
| [`workflow-feature`](workflow-feature/) | Plan → Implement → Review → Verify | Implementação completa de features |
| [`workflow-bugfix`](workflow-bugfix/) | Reproduce → Debug → Fix → Test | Correção sistemática de bugs |
| [`workflow-deploy`](workflow-deploy/) | Build → Test → Lint → Verify | Validação de deploy Docker |
| [`workflow-code-review`](workflow-code-review/) | Lint → Security → Review → Approve | Pipeline de code review |

### Referência (4 skills)

Skills que contêm boas práticas e checklists de referência:

| Skill | Domínio | Descrição |
|-------|---------|-----------|
| [`conventional-commit`](conventional-commit/) | Git | Commits padronizados via Conventional Commits spec |
| [`javascript-typescript-jest`](javascript-typescript-jest/) | Testes | Jest: estrutura, mocking, async, matchers |
| [`multi-stage-dockerfile`](multi-stage-dockerfile/) | Docker | Dockerfiles multi-stage otimizados |
| [`postgresql-code-review`](postgresql-code-review/) | Banco | JSONB, arrays, schema design, RLS, extensões |

## Onde skills podem ficar

| Local | Escopo | Exemplo |
|-------|--------|---------|
| `.github/skills/` | Projeto (repositório) | Este projeto |
| `.claude/skills/` | Projeto (alternativo) | Compatibilidade Claude |
| `~/.copilot/skills/` | Pessoal (todos os projetos) | Skills compartilhadas |
| `~/.claude/skills/` | Pessoal (alternativo) | Compatibilidade Claude |

## Skills da comunidade

Você pode usar skills criadas por outros:
- [github/awesome-copilot](https://github.com/github/awesome-copilot) — coleção curada pelo GitHub
- [anthropics/skills](https://github.com/anthropics/skills) — skills de referência

## Boas práticas para criar skills

1. **Uma skill por domínio** — não misture temas diferentes
2. **Description com keywords** — o modelo usa para decidir quando carregar
3. **Checklists concretos** — listas de verificação com critérios claros
4. **Exemplos reais** — mostre código bom vs ruim quando aplicável
5. **Critérios de saída** — defina quando a skill é "completa" (para workflows)
6. **Gate final** — para workflows, sempre termine com validação obrigatória

## Diagramas das Skills

### Workflows

| Skill | Diagrama |
|-------|----------|
| **workflow-feature** | [![workflow-feature](../../diagramas/SKILL%20-%20workflow-feature%20detalhado.jpg)](../../diagramas/SKILL%20-%20workflow-feature%20detalhado.jpg) |
| **workflow-bugfix** | [![workflow-bugfix](../../diagramas/SKILL%20-%20workflow-bugfix%20detalhado.jpg)](../../diagramas/SKILL%20-%20workflow-bugfix%20detalhado.jpg) |
| **workflow-deploy** | [![workflow-deploy](../../diagramas/SKILL%20-%20workflow-deploy%20detalhado.jpg)](../../diagramas/SKILL%20-%20workflow-deploy%20detalhado.jpg) |
| **workflow-code-review** | [![workflow-code-review](../../diagramas/SKILL%20-%20workflow-code-review%20detalhado.jpg)](../../diagramas/SKILL%20-%20workflow-code-review%20detalhado.jpg) |

### Referência

| Skill | Diagrama |
|-------|----------|
| **conventional-commit** | [![conventional-commit](../../diagramas/SKILL%20-%20conventional-commit.jpg)](../../diagramas/SKILL%20-%20conventional-commit.jpg) |
| **jest** | [![jest](../../diagramas/SKILL%20-%20JavaScript%20TypeScript%20Jest.jpg)](../../diagramas/SKILL%20-%20JavaScript%20TypeScript%20Jest.jpg) |
| **multi-stage-dockerfile** | [![dockerfile](../../diagramas/SKILL%20-%20multi-stage-dockerfile.jpg)](../../diagramas/SKILL%20-%20multi-stage-dockerfile.jpg) |
| **postgresql-code-review** | [![postgresql](../../diagramas/SKILL%20-%20postgresql-code-review.jpg)](../../diagramas/SKILL%20-%20postgresql-code-review.jpg) |

### Revisão de Código Gerado por AI

[![Revisão AI](../../diagramas/Revisao%20de%20Codigo%20Gerado%20por%20AI.png)](../../diagramas/Revisao%20de%20Codigo%20Gerado%20por%20AI.png)

> Checklist específico para revisar código gerado por IA: padrões do projeto, tipos TypeScript, dependências, testes, segurança OWASP, simplicidade. Essencial quando se usa as skills de code review com código produzido por agentes.

### Ciclo Completo das Skills

[![Ciclo Skills](../../diagramas/Ciclo%20Completo%20Skills.png)](../../diagramas/Ciclo%20Completo%20Skills.png)

> Ciclo de vida completo: criação → carregamento → execução → evolução

## Navegação

- ⬆️ [Voltar ao guia .github/](../GITHUB-COPILOT.md)
- ⬆️⬆️ [Voltar ao README principal](../../README.md)
- 🤖 [Agents](../agents/README.md) — agentes que carregam essas skills
- 📋 [Instructions](../agents/instructions/README.md) — regras automáticas complementares
- 💬 [Prompts](../prompts/README.md) — prompts que invocam workflows via orchestrator
