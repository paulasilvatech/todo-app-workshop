# `frontend/` — Interface React + TypeScript + Vite + TailwindCSS

O frontend é uma **SPA (Single Page Application)** com Kanban board, lista de tasks e painel de configurações. Roda em um container Docker com Vite dev server (desenvolvimento) ou Nginx (produção).

## Stack

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **React** | 18.x | Biblioteca de UI com componentes funcionais |
| **TypeScript** | 5.x | Tipagem estática (strict mode) |
| **Vite** | 5.x | Build tool e dev server (HMR) |
| **TailwindCSS** | 3.x | Utility-first CSS framework |
| **Zustand** | 4.x | Estado global (alternativa leve ao Redux) |
| **@dnd-kit** | — | Drag-and-drop para o Kanban board |
| **Vitest** | — | Framework de testes (compatível com Vite) |
| **React Router** | 6.x | Roteamento client-side |

## Estrutura de diretórios

```
frontend/
├── Dockerfile             # Multi-stage: development / production (nginx)
├── index.html             # HTML raiz (entry point do Vite)
├── nginx.conf             # Configuração nginx para produção (SPA fallback)
├── package.json           # Dependências e scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Configuração Vite (porta 5173)
├── tailwind.config.ts     # Configuração TailwindCSS
├── postcss.config.cjs     # PostCSS para TailwindCSS
└── src/
    ├── main.tsx           # Entry point React (ReactDOM.createRoot)
    ├── App.tsx            # Router + layout + navegação
    ├── index.css          # Estilos globais + Tailwind imports
    ├── types.ts           # Tipos compartilhados (Task, User, enums)
    ├── api/               # Camada HTTP
    ├── store/             # Estado global Zustand
    ├── hooks/             # Hooks customizados
    ├── components/        # Componentes reutilizáveis
    ├── pages/             # Páginas (rotas)
    └── __tests__/         # Testes Vitest
```

## Padrões arquiteturais

### Fluxo de dados

```
Componente React
    ↓ usa hook
useTask() / useAuth()
    ↓ acessa store
Zustand Store (taskStore / authStore)
    ↓ chama API
api/client.ts → fetch() com credentials
    ↓ comunica com
Backend (localhost:3001)
```

### Regras do projeto

- **API via `api/client.ts`** — nunca usar `fetch()` direto nos componentes
- **Estado global via Zustand** — sem prop drilling além de 2 níveis
- **Componentes funcionais** com hooks — sem class components
- **ARIA labels** em todos os elementos interativos (botões, inputs, links)
- **TypeScript strict** — zero `any` types
- **`@dnd-kit`** para drag-and-drop — nunca HTML5 Drag API direto

## Páginas e rotas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/board` | `BoardPage.tsx` | Kanban board com drag-and-drop (TODO, IN_PROGRESS, DONE) |
| `/list` | `ListPage.tsx` | Lista de tasks com filtros por status, prioridade e label |
| `/settings` | `SettingsPage.tsx` | Repositórios GitHub conectados e controles de sync |
| `/*` | Redirect → `/board` | Qualquer rota desconhecida redireciona para o board |

## Scripts disponíveis

```bash
npm run dev        # Vite dev server com HMR (porta 5173)
npm run build      # Build de produção (dist/)
npm run preview    # Preview do build de produção
npm test           # Testes Vitest
```

## Diagrama: Arquitetura Geral

[![Arquitetura Geral](../diagramas/TodoApp%20-%20Arquitetura%20Geral.jpg)](../diagramas/TodoApp%20-%20Arquitetura%20Geral.jpg)

> Visão macro: Usuário → **Frontend (:5173)** → Backend (:3001) → PostgreSQL (:5432) dentro do Docker Compose

## Navegação

- ⬆️ [Voltar ao README principal](../README.md)
- 📂 [Código-fonte (src/)](src/README.md) — componentes, hooks, store, tipos
- 🔧 [Backend](../backend/README.md) — API que este frontend consome
- 📊 [Diagramas](../diagramas/README.md) — arquitetura visual do projeto
- 🤖 [Agents](../.github/agents/README.md) — agentes AI que trabalham neste código
