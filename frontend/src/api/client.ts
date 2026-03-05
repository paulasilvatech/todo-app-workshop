import { Task, User, GitHubRepo, CreateTaskInput, UpdateTaskInput } from '../types'

const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3001'

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })

  if (res.status === 401) {
    return Promise.reject(new Error('Unauthorized'))
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  if (res.status === 204) return undefined as unknown as T
  return res.json() as Promise<T>
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const getMe = () => request<User>('/auth/me')
export const logout = () => request<void>('/auth/logout', { method: 'POST' })

// ── Tasks ───────────────────────────────────────────────────────────────────
export interface TaskFilters {
  status?: string
  priority?: string
  label?: string
}

export const getTasks = (filters?: TaskFilters) => {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.priority) params.set('priority', filters.priority)
  if (filters?.label) params.set('label', filters.label)
  const qs = params.toString()
  return request<Task[]>(`/tasks${qs ? `?${qs}` : ''}`)
}

export const getTask = (id: string) => request<Task>(`/tasks/${id}`)

export const createTask = (data: CreateTaskInput) =>
  request<Task>('/tasks', { method: 'POST', body: JSON.stringify(data) })

export const updateTask = (id: string, data: UpdateTaskInput) =>
  request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const deleteTask = (id: string) =>
  request<void>(`/tasks/${id}`, { method: 'DELETE' })

// ── GitHub ──────────────────────────────────────────────────────────────────
export interface GithubRepoItem {
  id: number
  name: string
  fullName: string
  owner: string
  private: boolean
}

export const getGithubRepos = () => request<GithubRepoItem[]>('/github/repos')
export const getConnectedRepos = () => request<GitHubRepo[]>('/github/connected-repos')
export const connectRepo = (data: { owner: string; name: string; fullName: string }) =>
  request<GitHubRepo>('/github/repos', { method: 'POST', body: JSON.stringify(data) })
export const disconnectRepo = (id: string) =>
  request<void>(`/github/repos/${id}`, { method: 'DELETE' })
export const importIssues = (repoId: string) =>
  request<{ imported: number; total: number }>(`/github/repos/${repoId}/import`, {
    method: 'POST',
  })
export const syncTasks = () =>
  request<{ synced: number; total: number }>('/github/sync')
