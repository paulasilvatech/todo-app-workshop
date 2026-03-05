import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTaskStore, selectTasksByStatus } from '../../store/taskStore'
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../../types'
import { TaskCard } from '../TaskCard/TaskCard'
import { TaskForm } from '../TaskForm/TaskForm'

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50' },
  { id: 'DONE', label: 'Done', color: 'bg-green-50' },
]

interface SortableTaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function SortableTaskCard({ task, onEdit, onDelete }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export function BoardPage() {
  const { tasks, fetchTasks, addTask, updateTask, removeTask } = useTaskStore()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Keyboard shortcut: 'n' opens new task form
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'n' &&
        !isCreating &&
        !editingTask &&
        !(e.target as HTMLElement).matches('input, textarea, select')
      ) {
        setIsCreating(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isCreating, editingTask])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      // over.id is the column id (TaskStatus) or a task id
      const targetStatus = COLUMNS.find((c) => c.id === over.id)?.id
      if (!targetStatus) return

      const task = tasks.find((t) => t.id === active.id)
      if (!task || task.status === targetStatus) return

      await updateTask(task.id, { status: targetStatus })
    },
    [tasks, updateTask]
  )

  const handleCreateSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    await addTask(data as CreateTaskInput)
  }

  const handleEditSubmit = async (data: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, data as UpdateTaskInput)
    }
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b bg-white">
        <h1 className="text-lg font-semibold text-gray-900">Board</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="New task (n)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Task
          <kbd className="ml-1 text-xs bg-blue-500 px-1 rounded">N</kbd>
        </button>
      </div>

      {/* Kanban columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((column) => {
              const columnTasks = selectTasksByStatus(tasks, column.id)

              return (
                <div
                  key={column.id}
                  className={`w-72 flex flex-col rounded-xl ${column.color} border border-gray-200`}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200">
                    <span className="text-sm font-semibold text-gray-700">
                      {column.label}
                    </span>
                    <span className="text-xs bg-white text-gray-500 rounded-full px-2 py-0.5 font-medium border border-gray-200">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Cards drop zone */}
                  <SortableContext
                    id={column.id}
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
                      {columnTasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onEdit={setEditingTask}
                          onDelete={removeTask}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  {/* Add task shortcut per column */}
                  <button
                    className="m-2 text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 px-2 py-1.5 rounded hover:bg-white/60 transition-colors"
                    onClick={() => setIsCreating(true)}
                    aria-label={`Add task to ${column.label}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add task
                  </button>
                </div>
              )
            })}
          </div>
        </DndContext>
      </div>

      {/* Modals */}
      {isCreating && (
        <TaskForm
          onSubmit={handleCreateSubmit}
          onClose={() => setIsCreating(false)}
        />
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
