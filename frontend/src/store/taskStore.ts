import { create } from 'zustand'
import { Task, TaskStatus, Priority, CreateTaskInput, UpdateTaskInput } from '../types'
import { getTasks, createTask, updateTask, deleteTask, TaskFilters } from '../api/client'

interface TaskState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filters: TaskFilters

  fetchTasks: (filters?: TaskFilters) => Promise<void>
  addTask: (data: CreateTaskInput) => Promise<Task>
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>
  removeTask: (id: string) => Promise<void>
  setFilters: (filters: TaskFilters) => void
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  filters: {},

  fetchTasks: async (filters?: TaskFilters) => {
    set({ isLoading: true, error: null })
    try {
      const activeFilters = filters ?? get().filters
      const tasks = await getTasks(activeFilters)
      set({ tasks, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  addTask: async (data: CreateTaskInput) => {
    const task = await createTask(data)
    set((state) => ({ tasks: [task, ...state.tasks] }))
    return task
  },

  updateTask: async (id: string, data: UpdateTaskInput) => {
    const updated = await updateTask(id, data)
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }))
    return updated
  },

  removeTask: async (id: string) => {
    await deleteTask(id)
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
  },

  setFilters: (filters: TaskFilters) => {
    set({ filters })
  },

  clearError: () => set({ error: null }),
}))

// Derived selectors
export const selectTasksByStatus = (tasks: Task[], status: TaskStatus) =>
  tasks.filter((t) => t.status === status)

export const PRIORITY_ORDER: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
