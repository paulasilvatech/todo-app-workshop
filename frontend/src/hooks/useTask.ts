import { useTaskStore } from '../store/taskStore'
import { TaskFilters } from '../api/client'

export function useTask(filters?: TaskFilters) {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    removeTask,
    setFilters,
    clearError,
  } = useTaskStore()

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    removeTask,
    setFilters,
    clearError,
    refetch: () => fetchTasks(filters),
  }
}
