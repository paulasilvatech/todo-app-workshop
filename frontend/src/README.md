# `src/` — Código-fonte do Frontend

Código-fonte da aplicação React. Segue o padrão **Components → Hooks → Store → API** com TypeScript strict e TailwindCSS.

## Estrutura

```
src/
├── main.tsx           # Entry point — ReactDOM.createRoot + BrowserRouter
├── App.tsx            # Rotas, layout, navegação principal
├── index.css          # Tailwind imports + estilos globais
├── types.ts           # Tipos TypeScript compartilhados
├── vite-env.d.ts      # Tipos do Vite (import.meta.env)
│
├── api/               # Camada HTTP
│   └── client.ts      # Fetch wrapper tipado com credentials
│
├── store/             # Estado global (Zustand)
│   ├── authStore.ts   # Estado de autenticação (user, isAuthenticated)
│   └── taskStore.ts   # Estado de tasks (CRUD, filtros, loading)
│
├── hooks/             # Hooks customizados
│   ├── useAuth.ts     # Hook de autenticação (fetchUser, logout)
│   ├── useTask.ts     # Hook de tasks (fetchTasks, addTask, updateTask)
│   └── useGitHub.ts   # Hook de integração GitHub (repos, sync, import)
│
├── components/        # Componentes reutilizáveis
│   ├── Board/         # Kanban board com @dnd-kit
│   │   └── BoardPage.tsx
│   ├── TaskCard/      # Card de task com badge de sync e drag handle
│   │   └── TaskCard.tsx
│   └── TaskForm/      # Modal de criação/edição com toggle de GitHub Issue
│       └── TaskForm.tsx
│
├── pages/             # Páginas (componentes de rota)
│   ├── ListPage.tsx   # Tabela com filtros por status, prioridade, label
│   └── SettingsPage.tsx # Gerenciar repos GitHub conectados
│
└── __tests__/         # Testes Vitest + React Testing Library
    ├── setup.ts           # Setup global (jsdom, mocks)
    ├── TaskCard.test.tsx   # Testes do componente TaskCard
    └── TaskForm.test.tsx   # Testes do componente TaskForm
```

## Fluxo de dados detalhado

### Criar uma task (exemplo)

```
[TaskForm] → usuário preenche formulário
    ↓ chama
useTask().addTask(data)
    ↓ atualiza
taskStore.addTask(data)
    ↓ chama
api/client.ts → createTask(data) → POST /tasks
    ↓ retorna
Task criada → store atualiza → componente re-renderiza
```

### Drag-and-drop no Board (exemplo)

```
[BoardPage] → @dnd-kit DndContext
    ↓ onDragEnd
Calcula novo status (TODO → IN_PROGRESS → DONE)
    ↓ chama
taskStore.updateTask(id, { status: novoStatus })
    ↓ chama
api/client.ts → updateTask(id, data) → PATCH /tasks/:id
    ↓
Task atualizada no backend e no store
```

## Arquivos-chave

### `api/client.ts` — Camada HTTP

Wrapper centralizado para todas as chamadas HTTP:
- Sempre envia `credentials: 'include'` (cookie de sessão)
- Header `Content-Type: application/json`
- Tratamento de erros HTTP (status !== ok)
- Funções exportadas: `getTasks`, `createTask`, `updateTask`, `deleteTask`, `getMe`, etc.

> **Regra**: Todo acesso à API **deve** passar por `api/client.ts`. Nunca usar `fetch()` direto em componentes.

### `store/taskStore.ts` — Estado Global

Zustand store para gerenciar tasks:
- `tasks[]` — lista de tasks
- `isLoading` — estado de loading
- `filters` — filtros ativos (status, prioridade, label)
- `fetchTasks()` — busca tasks da API com filtros
- `addTask()` — cria task e adiciona ao estado
- `updateTask()` — atualiza task no estado e na API
- `removeTask()` — remove task do estado e da API

### `types.ts` — Tipos Compartilhados

```typescript
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type SyncStatus = 'LOCAL_ONLY' | 'SYNCED' | 'OUT_OF_SYNC'

interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  // ... campos de GitHub sync, datas, etc.
}
```

## Navegação

- ⬆️ [Voltar ao README frontend/](../README.md)
- ⬆️⬆️ [Voltar ao README principal](../../README.md)
- 🔧 [Backend src/](../../backend/src/README.md) — código da API que este frontend consome
- 🤖 [Agents](../../.github/agents/README.md) — agentes AI especializados
