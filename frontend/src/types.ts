// All shared types for the frontend
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
export type SyncStatus = 'LOCAL_ONLY' | 'SYNCED' | 'OUT_OF_SYNC'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  labels: string[]
  assignee: string | null
  githubIssueNumber: number | null
  githubIssueUrl: string | null
  githubRepoId: string | null
  syncStatus: SyncStatus
  userId: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  githubId: number
  username: string
  avatarUrl: string | null
}

export interface GitHubRepo {
  id: string
  owner: string
  name: string
  fullName: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: string
  labels?: string[]
  assignee?: string
  createGithubIssue?: boolean
  repoId?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  dueDate?: string | null
  labels?: string[]
  assignee?: string | null
}
