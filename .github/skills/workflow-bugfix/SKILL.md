---
name: workflow-bugfix
description: 'Workflow de correção de bugs para o TodoApp. Define as fases Reproduce → Debug → Fix → Test para correção sistemática. Invocada pelo agente orchestrator quando o tipo de tarefa é "bug", "fix", "corrigir" ou "erro".'
---

# Workflow: Bug Fix

Workflow sequencial para investigar e corrigir bugs de forma sistemática no TodoApp.

## Fases

### 1. REPRODUCE — Entender e reproduzir o bug

**Objetivo**: Entender o comportamento esperado vs. observado e reproduzir o bug.

**Ações**:
1. Documentar o comportamento esperado
2. Documentar o comportamento observado (mensagem de erro, stack trace, screenshot)
3. Identificar os passos para reproduzir
4. Identificar a camada afetada: frontend, backend, database, infra
5. Identificar os arquivos provavelmente envolvidos

**Subagente**: `QA` (para descrever o cenário de reprodução)

**Critérios de saída**:
- [ ] Bug reproduzido com passos claros
- [ ] Comportamento esperado vs. observado documentado
- [ ] Camada e arquivos suspeitos identificados

---

### 2. DEBUG — Investigar a causa raiz

**Objetivo**: Encontrar a causa raiz do bug.

**Subagente**: `Debug Mode`

**Ações**:
1. Analisar stack trace / logs de erro
2. Ler os arquivos suspeitos identificados na fase anterior
3. Usar grep/search para encontrar o ponto exato do problema
4. Verificar se é um bug de:
   - **Lógica**: condição errada, tipo errado
   - **Estado**: race condition, estado stale no Zustand
   - **Integração**: resposta inesperada da API, schema Prisma inconsistente
   - **Ambiente**: variável de ambiente faltando, Docker config errada
5. Identificar a causa raiz com confiança

**Critérios de saída**:
- [ ] Causa raiz identificada
- [ ] Arquivo(s) e linha(s) exata(s) do problema
- [ ] Explicação de POR QUE o bug acontece

---

### 3. FIX — Implementar a correção

**Objetivo**: Corrigir o bug com a menor mudança possível.

**Regras**:
- Correção mínima — não refatorar código não relacionado
- Manter padrões do projeto (Zod, Prisma, TypeScript strict)
- Se o fix envolve frontend: manter ARIA labels, usar api/client.ts
- Se o fix envolve backend: manter error responses `{ error, code }`
- Se o fix envolve database: usar Prisma migration se schema mudar

**Subagente**: Depende da camada — mesmo mapeamento da skill `workflow-feature`

**Critérios de saída**:
- [ ] Bug corrigido no código
- [ ] `npx tsc --noEmit` sem erros
- [ ] Sem `any` types introduzidos

---

### 4. TEST — Garantir regressão zero

**Objetivo**: Confirmar que o bug está corrigido e nada mais quebrou.

**Subagente**: `QA`

**Ações**:
1. Verificar que os testes existentes ainda passam: `npm test` (backend + frontend)
2. **Escrever um teste de regressão** que:
   - Reproduz o cenário do bug
   - Verifica que o comportamento correto acontece
   - Garante que o bug não volta
3. Rodar o novo teste e confirmar que passa
4. Type-check final: `npx tsc --noEmit`

**Critérios de saída**:
- [ ] Todos os testes existentes passam
- [ ] Teste de regressão criado e passando
- [ ] TypeScript type-check limpo

---

## Gate Final

O bug fix só é considerado completo quando:
1. ✅ Causa raiz identificada e documentada
2. ✅ Correção implementada com mudança mínima
3. ✅ Teste de regressão criado
4. ✅ Todos os testes passam (incluindo o novo)
5. ✅ Type-check limpo
