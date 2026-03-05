# `instructions/` — Custom Instructions por Tipo de Arquivo

Custom Instructions são **regras automáticas** que o GitHub Copilot aplica sem que você precise pedir. Usando o campo `applyTo` no frontmatter, você restringe as instruções a arquivos que correspondem a padrões glob.

📖 **Link oficial**: [Adding Repository Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

## Como funciona

Cada arquivo `.instructions.md` tem:

```yaml
---
applyTo: '**/*.ts'           # Padrão glob — quando ativar
description: 'Descrição'     # O que essas instruções fazem
---
```

Quando o Copilot trabalha com um arquivo que corresponde ao `applyTo`, as instruções são **automaticamente adicionadas ao contexto** — sem precisar mencionar ou referenciar o arquivo.

## Instructions deste projeto

| Arquivo | Aplica-se a | Descrição |
|---------|-------------|-----------|
| [`typescript.instructions.md`](typescript.instructions.md) | `**/*.ts` | TypeScript 5.x, ES2022, clean code, tipos explícitos |
| [`reactjs.instructions.md`](reactjs.instructions.md) | `**/*.jsx, **/*.tsx, **/*.js, **/*.ts, **/*.css` | React 19+, hooks, componentes funcionais, acessibilidade |
| [`containerization-docker.instructions.md`](containerization-docker.instructions.md) | `**/Dockerfile*, **/docker-compose*.yml` | Docker multi-stage, segurança, otimização de layers |
| [`secure-coding-owasp.instructions.md`](secure-coding-owasp.instructions.md) | `*` (todos os arquivos) | OWASP Top 10, coding seguro, validação de inputs |

## Exemplo: como o `applyTo` funciona

```yaml
---
applyTo: '**/*.ts'
---
```

| Arquivo sendo editado | Instrução ativada? |
|-----------------------|-------------------|
| `backend/src/server.ts` | ✅ Sim — corresponde a `**/*.ts` |
| `frontend/src/App.tsx` | ❌ Não — `.tsx` não é `.ts` |
| `docker-compose.yml` | ❌ Não — `.yml` não é `.ts` |

Para cobrir múltiplos tipos, use vírgula:
```yaml
applyTo: '**/*.ts, **/*.tsx'
```

## Padrões glob comuns

| Padrão | Corresponde a |
|--------|---------------|
| `*` | Todos os arquivos |
| `**/*.ts` | Qualquer `.ts` em qualquer profundidade |
| `src/**/*.tsx` | Arquivos `.tsx` dentro de `src/` recursivamente |
| `**/Dockerfile*` | Qualquer arquivo que começa com `Dockerfile` |
| `**/*.test.ts` | Qualquer arquivo de teste TypeScript |

## Prioridade de instruções

Quando múltiplas instruções se aplicam ao mesmo arquivo, todas são fornecidas ao Copilot. A prioridade é:

1. **Personal instructions** (configuração do usuário) — maior prioridade
2. **Repository instructions** (`copilot-instructions.md` + `.instructions.md`)
3. **Organization instructions** — menor prioridade

> ⚠️ Evite conflitos entre instruções. Se duas instruções dizem coisas opostas, o resultado pode ser inconsistente.

## Navegação

- ⬆️ [Voltar ao README agents/](../README.md)
- ⬆️⬆️ [Voltar ao README .github/](../../README.md)
- ⬆️⬆️⬆️ [Voltar ao README principal](../../../README.md)
- 🤖 [Agents](../README.md) — agentes que usam essas instructions
- 🛠️ [Skills](../../skills/README.md) — skills carregadas pelos agentes
