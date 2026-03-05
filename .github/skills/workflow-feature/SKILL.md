---
name: workflow-feature
description: 'Workflow de implementação de features para o TodoApp. Define as fases Plan → Implement → Review → Verify, critérios de aceite por fase, e quais subagentes usar. Invocada pelo agente orchestrator quando o tipo de tarefa é "feature" ou "nova funcionalidade".'
---

# Workflow: Feature Implementation

Workflow sequencial para implementar novas funcionalidades no TodoApp.

## Fases

### 1. PLAN — Escopo e Análise

**Objetivo**: Entender o que precisa ser feito e quais arquivos serão afetados.

**Ações**:
1. Identificar a camada afetada: `backend`, `frontend`, ou ambas
2. Listar arquivos que precisam ser criados ou modificados
3. Identificar dependências (modelos Prisma, rotas existentes, componentes React)
4. Definir critérios de aceite claros

**Critérios de saída da fase**:
- [ ] Escopo documentado com lista de arquivos afetados
- [ ] Camada(s) identificada(s)
- [ ] Critérios de aceite definidos

**Subagente sugerido**: Nenhum (orchestrator faz diretamente)

---

### 2. IMPLEMENT — Codificação

**Objetivo**: Implementar a funcionalidade seguindo os padrões do projeto.

**Delegação por camada**:
| Camada | Subagente | O que implementa |
|--------|-----------|------------------|
| Frontend React | `Expert React Frontend Engineer` | Componentes, hooks, store Zustand, páginas |
| Backend API | Orchestrator (direto) | Rotas Fastify, serviços, schemas Zod |
| Database | `PostgreSQL Database Administrator` | Schema Prisma, migrações, indexes |
| Infra | `DevOps Expert` | Dockerfile, docker-compose, variáveis de ambiente |

**Regras obrigatórias durante implementação**:
- TypeScript `strict: true` — zero `any`
- Inputs de rota validados com Zod
- `userId` lido de `request.user` — nunca do body
- Componentes React com ARIA labels
- API calls via `src/api/client.ts`
- Prisma transactions para operações multi-tabela

**Critérios de saída da fase**:
- [ ] Código implementado em todos os arquivos listados no PLAN
- [ ] `npx tsc --noEmit` sem erros no backend E frontend
- [ ] Sem `any` types no diff

---

### 3. REVIEW — Revisão de Código

**Objetivo**: Garantir qualidade, segurança e aderência aos padrões.

**Subagente**: `Code Reviewer`

**Checklist de revisão**:
- [ ] Validação Zod em TODA entrada de rota
- [ ] Sem raw SQL — apenas Prisma
- [ ] Tokens GitHub nunca expostos em API responses
- [ ] `userId` nunca vindo do request body
- [ ] Respostas de erro estruturadas: `{ error, code }`
- [ ] Componentes React sem prop drilling (>2 níveis → Zustand)
- [ ] ARIA labels em elementos interativos
- [ ] Sem dependências novas desnecessárias

**Critérios de saída da fase**:
- [ ] Todas as issues de revisão corrigidas
- [ ] Code reviewer aprova

---

### 4. VERIFY — Testes e Validação Final

**Objetivo**: Confirmar que a feature funciona e não quebrou nada.

**Subagente**: `QA`

**Ações**:
1. Verificar testes existentes passam: `npm test` no backend e frontend
2. Avaliar necessidade de novos testes para a feature implementada
3. Criar testes unitários se necessário (Jest backend, Vitest frontend)
4. Verificar type-check final: `npx tsc --noEmit`

**Critérios de saída da fase**:
- [ ] Todos os testes passam (backend + frontend)
- [ ] TypeScript type-check limpo
- [ ] Novos testes cobrem os cenários principais da feature

---

## Gate Final

O workflow só é considerado completo quando TODAS as condições são atendidas:
1. ✅ Type-check limpo (`tsc --noEmit`) no backend E frontend
2. ✅ Todos os testes passam (`npm test`) no backend E frontend
3. ✅ Code reviewer aprovou
4. ✅ Sem `any` types introduzidos
