import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskCard } from '../components/TaskCard/TaskCard'
import { Task } from '../types'

const baseTask: Task = {
  id: 'task_1',
  title: 'Implement OAuth flow',
  description: 'Set up GitHub OAuth',
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2026-04-01T00:00:00.000Z',
  labels: ['backend', 'auth'],
  assignee: 'alice',
  githubIssueNumber: 42,
  githubIssueUrl: 'https://github.com/octocat/repo/issues/42',
  githubRepoId: 'repo_1',
  syncStatus: 'SYNCED',
  userId: 'user_1',
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
}

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('Implement OAuth flow')).toBeInTheDocument()
  })

  it('renders priority badge with correct text', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })

  it('renders labels', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByText('backend')).toBeInTheDocument()
    expect(screen.getByText('auth')).toBeInTheDocument()
  })

  it('renders green sync dot for SYNCED status', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    const dot = screen.getByLabelText('Synced with GitHub')
    expect(dot).toHaveClass('bg-green-400')
  })

  it('renders yellow sync dot for OUT_OF_SYNC status', () => {
    const task = { ...baseTask, syncStatus: 'OUT_OF_SYNC' as const }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />)
    const dot = screen.getByLabelText('Out of sync')
    expect(dot).toHaveClass('bg-yellow-400')
  })

  it('renders gray sync dot for LOCAL_ONLY status', () => {
    const task = { ...baseTask, syncStatus: 'LOCAL_ONLY' as const, githubIssueUrl: null }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />)
    const dot = screen.getByLabelText('Local only')
    expect(dot).toHaveClass('bg-gray-300')
  })

  it('calls onEdit when card is clicked', () => {
    const onEdit = vi.fn()
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /edit task/i }))
    expect(onEdit).toHaveBeenCalledWith(baseTask)
  })

  it('calls onDelete when delete button is clicked without triggering onEdit', () => {
    const onEdit = vi.fn()
    const onDelete = vi.fn()
    render(<TaskCard task={baseTask} onEdit={onEdit} onDelete={onDelete} />)
    fireEvent.click(screen.getByLabelText('Delete task'))
    expect(onDelete).toHaveBeenCalledWith('task_1')
    expect(onEdit).not.toHaveBeenCalled()
  })

  it('renders GitHub link when githubIssueUrl is set', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    const link = screen.getByLabelText('GitHub Issue #42')
    expect(link).toHaveAttribute('href', baseTask.githubIssueUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('does not render GitHub link when githubIssueUrl is null', () => {
    const task = { ...baseTask, githubIssueUrl: null, githubIssueNumber: null }
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByLabelText(/GitHub Issue/)).toBeNull()
  })

  it('renders due date when set', () => {
    render(<TaskCard task={baseTask} onEdit={vi.fn()} onDelete={vi.fn()} />)
    // Date formatting is locale-dependent, just check some date text is present
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })
})
