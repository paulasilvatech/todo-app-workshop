import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaskForm } from '../components/TaskForm/TaskForm'

// Mock the API client
vi.mock('../api/client', () => ({
  getConnectedRepos: vi.fn().mockResolvedValue([
    { id: 'repo_1', owner: 'octocat', name: 'my-repo', fullName: 'octocat/my-repo' },
  ]),
}))

describe('TaskForm — Create mode', () => {
  const onSubmit = vi.fn()
  const onClose = vi.fn()

  beforeEach(() => {
    onSubmit.mockReset()
    onClose.mockReset()
    onSubmit.mockResolvedValue(undefined)
  })

  it('renders the form title as "New Task"', () => {
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText('New Task')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty title', async () => {
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /create task/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with correct data on valid form', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)

    await user.type(screen.getByLabelText(/title/i), 'My new task')
    await user.click(screen.getByRole('button', { name: /create task/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My new task' })
      )
    })
  })

  it('calls onClose when Cancel is clicked', async () => {
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose after successful submit', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)

    await user.type(screen.getByLabelText(/title/i), 'Close after submit')
    await user.click(screen.getByRole('button', { name: /create task/i }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('shows GitHub issue checkbox for new tasks', () => {
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText('Create GitHub Issue')).toBeInTheDocument()
  })

  it('shows repo selector when GitHub issue checkbox is checked', async () => {
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)
    const checkbox = screen.getByRole('checkbox', { name: /create github issue/i })
    fireEvent.click(checkbox)
    await waitFor(() => {
      expect(screen.getByLabelText('Select repository')).toBeInTheDocument()
    })
  })

  it('parses labels correctly from comma-separated input', async () => {
    const user = userEvent.setup()
    render(<TaskForm onSubmit={onSubmit} onClose={onClose} />)

    await user.type(screen.getByLabelText(/title/i), 'Label test')
    await user.type(screen.getByLabelText(/labels/i), 'frontend, bug, enhancement')
    await user.click(screen.getByRole('button', { name: /create task/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: ['frontend', 'bug', 'enhancement'],
        })
      )
    })
  })
})

describe('TaskForm — Edit mode', () => {
  const mockTask = {
    id: 'task_1',
    title: 'Existing task',
    description: 'Existing description',
    status: 'IN_PROGRESS' as const,
    priority: 'HIGH' as const,
    dueDate: null,
    labels: ['backend'],
    assignee: 'alice',
    githubIssueNumber: null,
    githubIssueUrl: null,
    githubRepoId: null,
    syncStatus: 'LOCAL_ONLY' as const,
    userId: 'user_1',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  it('renders the form title as "Edit Task"', () => {
    render(<TaskForm task={mockTask} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Edit Task')).toBeInTheDocument()
  })

  it('pre-fills title from existing task', () => {
    render(<TaskForm task={mockTask} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Existing task')).toBeInTheDocument()
  })

  it('pre-fills labels from existing task', () => {
    render(<TaskForm task={mockTask} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('backend')).toBeInTheDocument()
  })

  it('does not show GitHub issue checkbox in edit mode', () => {
    render(<TaskForm task={mockTask} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.queryByText('Create GitHub Issue')).toBeNull()
  })
})
