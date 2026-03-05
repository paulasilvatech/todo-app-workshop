---
mode: agent
description: 'Executar code review completo no TodoApp: Lint → Security → Review → Approve via orchestrator'
---

# Code Review — TodoApp

Use o agente `@orchestrator` para executar o workflow de code review completo.

## O que revisar?

Indique o escopo da revisão:
- "Revise os últimos commits"
- "Revise o arquivo backend/src/routes/tasks.ts"
- "Revise todas as mudanças no frontend/src/components/"

## Checklist aplicado automaticamente

### TypeScript
- [ ] Zero erros de `tsc --noEmit`
- [ ] Zero `any` types

### Segurança (OWASP)
- [ ] Sem raw SQL — apenas Prisma
- [ ] Tokens nunca expostos em responses
- [ ] userId sempre de session cookie
- [ ] Webhook com HMAC-SHA256 verificado
- [ ] Inputs validados com Zod

### Backend (Fastify)
- [ ] Zod schemas em todas as rotas
- [ ] Error responses `{ error, code }`
- [ ] Prisma transactions multi-tabela

### Frontend (React)
- [ ] Componentes funcionais + hooks
- [ ] Zustand para estado global
- [ ] ARIA labels em interativos
- [ ] API via `src/api/client.ts`

## Resultado

O code reviewer produz um relatório com:
- 🔴 **CRITICAL** — Deve corrigir
- 🟡 **WARNING** — Recomendado corrigir
- 🔵 **SUGGESTION** — Opcional

Decisão final: ✅ APPROVED | ⚠️ APPROVED WITH WARNINGS | ❌ CHANGES REQUESTED
