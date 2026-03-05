import { useState, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { Task, TaskStatus, Priority, CreateTaskInput, UpdateTaskInput } from '../types'
import { TaskForm } from '../components/TaskForm/TaskForm'

const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  HIGH: 'text-red-600',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-green-600',
}

export function ListPage() {
  const { tasks, fetchTasks, addTask, updateTask, removeTask, setFilters, filters } =
    useTaskStore()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [sortField, setSortField] = useState<keyof Task>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks, filters])

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    const av = a[sortField] ?? ''
    const bv = b[sortField] ?? ''
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const SortIcon = ({ field }: { field: keyof Task }) =>
    sortField === field ? (
      <span aria-hidden="true">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
    ) : null

  const handleEditSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) await updateTask(editingTask.id, data as UpdateTaskInput)
  }

  const handleCreateSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    await addTask(data as CreateTaskInput)
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white flex-wrap gap-3">
        <h1 className="text-lg font-semibold text-gray-900">Tasks</h1>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Filter by status"
            value={filters.status ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setFilters({ ...filters, status: v || undefined })
              fetchTasks({ ...filters, status: v || undefined })
            }}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          <select
            aria-label="Filter by priority"
            value={filters.priority ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setFilters({ ...filters, priority: v || undefined })
              fetchTasks({ ...filters, priority: v || undefined })
            }}
            className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th
                  className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('title')}
                  aria-sort={sortField === 'title' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  Title <SortIcon field="title" />
                </th>
                <th
                  className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('status')}
                >
                  Status <SortIcon field="status" />
                </th>
                <th
                  className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600"
                  onClick={() => handleSort('priority')}
                >
                  Priority <SortIcon field="priority" />
                </th>
                <th
                  className="text-left px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600 hidden md:table-cell"
                  onClick={() => handleSort('dueDate')}
                >
                  Due <SortIcon field="dueDate" />
                </th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium hidden lg:table-cell">
                  Labels
                </th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Sync</th>
                <th className="px-4 py-3" aria-label="Actions"></th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-12">
                    No tasks yet.{' '}
                    <button
                      onClick={() => setIsCreating(true)}
                      className="text-blue-600 underline"
                    >
                      Create one
                    </button>
                    .
                  </td>
                </tr>
              )}
              {sortedTasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setEditingTask(task)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Edit task: ${task.title}`}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingTask(task)}
                >
                  <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-900">
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {STATUS_LABEL[task.status]}
                  </td>
                  <td className={`px-4 py-3 font-medium ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {task.labels.slice(0, 2).map((l) => (
                        <span
                          key={l}
                          className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
                        >
                          {l}
                        </span>
                      ))}
                      {task.labels.length > 2 && (
                        <span className="text-xs text-gray-400">
                          +{task.labels.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        task.syncStatus === 'SYNCED'
                          ? 'bg-green-400'
                          : task.syncStatus === 'OUT_OF_SYNC'
                          ? 'bg-yellow-400'
                          : 'bg-gray-300'
                      }`}
                      title={task.syncStatus}
                      aria-label={task.syncStatus}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeTask(task.id)
                      }}
                      className="text-gray-300 hover:text-red-500 p-1"
                      aria-label="Delete task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreating && (
        <TaskForm onSubmit={handleCreateSubmit} onClose={() => setIsCreating(false)} />
      )}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={handleEditSubmit}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  )
}
