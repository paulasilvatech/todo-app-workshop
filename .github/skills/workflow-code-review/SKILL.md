---
name: workflow-code-review
description: 'Workflow de code review para o TodoApp. Define as fases Lint → Security → Review → Approve com checklist completo. Invocada pelo agente orchestrator quando o tipo de tarefa é "review", "code review" ou "revisar código".'
---

# Workflow: Code Review Pipeline

Workflow sequencial para revisar código com foco em qualidade, segurança e aderência aos padrões do TodoApp.

## Fases

### 1. LINT — Verificação estática

**Objetivo**: Checar erros de tipo e formatação.

**Ações**:
1. Rodar `npx tsc --noEmit` no backend — coletar erros
2. Rodar `npx tsc --noEmit` no frontend — coletar erros
3. Verificar que não existe uso de `any` nos arquivos modificados
4. Verificar que imports estão corretos (sem circular dependencies)

**Subagente**: Nenhum (orchestrator valida diretamente)

**Critérios de saída**:
- [ ] Zero erros de TypeScript
- [ ] Zero `any` types nos arquivos em review

---

### 2. SECURITY — Análise de segurança OWASP

**Objetivo**: Identificar vulnerabilidades de segurança.

**Checklist (baseado no OWASP Top 10)**:
- [ ] **Injection (A03)**: Sem raw SQL — apenas Prisma queries parametrizadas
- [ ] **Broken Auth (A07)**: `userId` sempre de `request.user` (cookie), nunca de body/params
- [ ] **Crypto Failures (A02)**: Tokens GitHub encriptados com AES-256-GCM, nunca em plaintext
- [ ] **SSRF (A10)**: URLs de webhook validadas, sem fetch para URLs arbitrárias
- [ ] **Security Misc (A05)**: CORS configurado apenas para `FRONTEND_URL`, cookies HttpOnly + SameSite
- [ ] **XSS**: Inputs sanitizados via Zod schemas — nunca renderizar HTML raw do user
- [ ] **Sensitive Data**: `encryptedToken` nunca retornado em responses de API
- [ ] **Webhook**: Verificação HMAC-SHA256 com `crypto.timingSafeEqual`

**Subagente**: Nenhum (orchestrator avalia com base no checklist acima)

**Critérios de saída**:
- [ ] Todas as checks de segurança passam
- [ ] Nenhuma vulnerabilidade HIGH detectada

---

### 3. REVIEW — Revisão de padrões e qualidade

**Objetivo**: Revisar aderência aos padrões arquitecturais do projeto.

**Subagente**: `Code Reviewer`

**Checklist de revisão**:

**Backend (Fastify)**:
- [ ] Rotas usam Zod schemas para validar body/query/params
- [ ] Serviços separados dos route handlers
- [ ] Erros retornados como `{ error: string, code: string }`
- [ ] `fastify-plugin` (fp) usado para plugins que escapam encapsulamento
- [ ] Prisma transactions para operações multi-tabela

**Frontend (React)**:
- [ ] Componentes funcionais com hooks
- [ ] Estado global via Zustand (não prop drilling >2 níveis)
- [ ] API calls via `src/api/client.ts`
- [ ] ARIA labels em todos os elementos interativos
- [ ] `@dnd-kit` para drag-and-drop

**Database (Prisma)**:
- [ ] Indexes definidos com `@@index` onde necessário
- [ ] Cascade deletes configurados
- [ ] Datas em UTC

**Critérios de saída**:
- [ ] Todas as issues encontradas documentadas
- [ ] Severidades atribuídas (critical / warning / suggestion)

---

### 4. APPROVE — Decisão final

**Objetivo**: Aprovar ou solicitar mudanças.

**Regras de decisão**:
| Situação | Ação |
|----------|------|
| Zero issues | ✅ **Aprovado** |
| Só suggestions | ✅ **Aprovado** com sugestões opcionais |
| Warnings sem critical | ⚠️ **Aprovado condicionalmente** — warnings devem ser corrigidos |
| Qualquer critical | ❌ **Mudanças solicitadas** — deve corrigir antes de aprovar |

**Critérios de saída**:
- [ ] Status de aprovação definido: `approved`, `approved_with_suggestions`, `changes_requested`
- [ ] Feedback documentado

---

## Gate Final

O code review só é considerado completo quando:
1. ✅ Lint passou (tsc clean)
2. ✅ Security check sem criticals
3. ✅ Review realizado com feedback documentado
4. ✅ Decisão de aprovação comunicada
