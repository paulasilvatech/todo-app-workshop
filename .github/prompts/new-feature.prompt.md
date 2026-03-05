---
mode: agent
description: 'Adicionar uma nova feature ao TodoApp seguindo o workflow completo: Plan → Implement → Review → Verify via orchestrator'
---

# Nova Feature — TodoApp

Use o agente `@orchestrator` para executar o workflow de feature completo.

## O que você quer implementar?

Descreva a feature que deseja adicionar. Exemplos:
- "Adicionar filtro por label na lista de tasks"
- "Criar notificações quando uma task é atribuída"
- "Adicionar campo de prioridade customizada"

## Contexto do projeto

- **Backend**: Fastify + TypeScript + Prisma (PostgreSQL)
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Zustand
- **Testes**: Jest (backend) + Vitest (frontend)
- **Docker**: docker-compose.yml com postgres, backend, frontend

## Workflow que será seguido

1. **PLAN** — Identificar escopo, camadas afetadas, arquivos a modificar
2. **IMPLEMENT** — Delegar para subagentes especializados (React Engineer, DBA, DevOps)
3. **REVIEW** — Code Reviewer verifica segurança, padrões, TypeScript strict
4. **VERIFY** — QA valida testes, type-check, regressão

## Gate Final obrigatório
- `npx tsc --noEmit` limpo (backend + frontend)
- `npm test` passando (backend + frontend)
- Zero `any` types introduzidos
