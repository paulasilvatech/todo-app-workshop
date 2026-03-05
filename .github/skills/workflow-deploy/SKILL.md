---
name: workflow-deploy
description: 'Workflow de deploy e validação de release para o TodoApp. Define as fases Build → Test → Lint → Verify para garantir que o ambiente Docker Compose está saudável. Invocada pelo agente orchestrator quando o tipo de tarefa é "deploy", "build" ou "release".'
---

# Workflow: Deploy & Release Validation

Workflow sequencial para validar que o projeto está pronto para deploy local (ou preparado para CI/CD futuro).

## Fases

### 1. BUILD — Verificar builds Docker

**Objetivo**: Garantir que todos os Dockerfiles compilam sem erro.

**Ações**:
1. Executar `docker compose build` — verificar que backend e frontend buildaram sem erro
2. Verificar que `docker compose up` inicia os 3 serviços (postgres, backend, frontend)
3. Checar healthcheck do PostgreSQL (`pg_isready`)
4. Checar que o backend responde em `GET /health`

**Subagente**: `DevOps Expert`

**Critérios de saída da fase**:
- [ ] `docker compose build` sem erros
- [ ] Todos os 3 serviços iniciam
- [ ] `GET /health` retorna `{ status: "ok" }`

---

### 2. TEST — Executar suite de testes

**Objetivo**: Garantir que todos os testes passam dentro do ambiente.

**Ações**:
1. Backend: `docker compose exec backend npm test` — todos os Jest testes passam
2. Frontend: `docker compose exec frontend npm test` — todos os Vitest testes passam
3. Verificar coverage mínimo (se configurado)

**Subagente**: `QA`

**Critérios de saída da fase**:
- [ ] Backend: todos os testes passam
- [ ] Frontend: todos os testes passam
- [ ] Zero testes skippados sem justificativa

---

### 3. LINT — Verificação de tipos e qualidade

**Objetivo**: Validar que o código está limpo tipo-safe.

**Ações**:
1. Backend: `npx tsc --noEmit` — TypeScript sem erros
2. Frontend: `npx tsc --noEmit` — TypeScript sem erros
3. Verificar que não existem `TODO` ou `FIXME` críticos no diff recente
4. Verificar que `.env.example` está atualizado com todas as variáveis usadas

**Subagente**: Nenhum (orchestrator valida diretamente)

**Critérios de saída da fase**:
- [ ] Zero erros de TypeScript
- [ ] `.env.example` completo
- [ ] Sem `console.log` de debug no código de produção

---

### 4. VERIFY — Smoke test do ambiente

**Objetivo**: Confirmar que a aplicação funcional de ponta a ponta.

**Ações**:
1. Verificar que o frontend carrega em `http://localhost:5173`
2. Verificar que o OAuth redirect funciona (`/auth/github`)
3. Verificar que a API responde a rotas protegidas com 401 (sem cookie)
4. Verificar que a rota de webhook responde com 401 para signature inválida
5. Verificar volumes e hot-reload configurados (dev mode)

**Subagente**: `DevOps Expert`

**Critérios de saída da fase**:
- [ ] Frontend acessível
- [ ] API retorna 401 corretamente sem auth
- [ ] Webhook rejeita signature inválida
- [ ] Hot-reload funciona

---

## Gate Final

O deploy só é considerado válido quando:
1. ✅ Docker build sem erros
2. ✅ Todos os testes passam
3. ✅ TypeScript type-check limpo
4. ✅ Smoke tests passam
5. ✅ `.env.example` atualizado
