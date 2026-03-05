# `.github/` — Customização do GitHub Copilot

Esta pasta contém toda a **customização do GitHub Copilot** para o TodoApp Workshop. Aqui ficam os agentes, skills, instruções e prompts que ensinam o Copilot a trabalhar de forma especializada no projeto.

## Estrutura

```
.github/
├── agents/              # 🤖 Custom Agents — personas especializadas
│   ├── instructions/    # 📋 Path-specific Instructions — regras por tipo de arquivo
│   └── *.agent.md       # Arquivos de agente
├── skills/              # 🛠️ Agent Skills — conhecimento de domínio reutilizável
│   └── */SKILL.md       # Uma pasta por skill
└── prompts/             # 💬 Prompt Files — prompts reutilizáveis
    └── *.prompt.md      # Prompts para tarefas recorrentes
```

## O que cada subpasta faz

| Pasta | Tipo | Quantidade | Descrição |
|-------|------|------------|-----------|
| [`agents/`](agents/) | Custom Agents | 7 agentes | Personas com tools e instruções específicas |
| [`agents/instructions/`](agents/instructions/) | Custom Instructions | 4 arquivos | Regras automáticas por tipo de arquivo (TypeScript, React, Docker, OWASP) |
| [`skills/`](skills/) | Agent Skills | 8 skills | Conhecimento de domínio: workflows, checklists, boas práticas |
| [`prompts/`](prompts/) | Prompt Files | 3 prompts | Prompts prontos para build, code review e nova feature |

## Como tudo se conecta

```
Usuário faz um pedido
       ↓
[Orchestrator Agent]  ← lê .agent.md
       ↓
Detecta tipo → carrega SKILL.md correspondente
       ↓
Delega para subagente especializado  ← lê .agent.md + tools
       ↓
Instructions são aplicadas automaticamente  ← .instructions.md (applyTo)
       ↓
Resultado validado com critérios da skill
```

## Diagrama: Orchestrador & Handoffs

[![Orchestrador](../diagramas/Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg)](../diagramas/Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg)

> Fluxo completo: Detectar Tipo → Carregar Skill → Executar Fases → Validar Handoff → Gate Final

## Navegação

- ⬆️ [Voltar ao README principal](../README.md)
- 🤖 [README dos Agents](agents/README.md)
- 📋 [README das Instructions](agents/instructions/README.md)
- 🛠️ [README das Skills](skills/README.md)
- 💬 [README dos Prompts](prompts/README.md)
- 📊 [README dos Diagramas](../diagramas/README.md)

## Links oficiais

- [Custom Agents & Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [Customization Cheat Sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)
