import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { taskService } from '../services/taskService'
import { GitHubService } from '../services/githubService'
import { decrypt } from '../lib/crypto'
import { prisma } from '../lib/prisma'
import { TaskStatus, Priority } from '@prisma/client'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  createGithubIssue: z.boolean().optional(),
  repoId: z.string().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().nullable().optional(),
})

export const taskRoutes: FastifyPluginAsync = async (app) => {
  // ── GET /tasks ─────────────────────────────────────────────────────────────
  app.get<{
    Querystring: { status?: string; priority?: string; label?: string }
  }>('/', async (request, reply) => {
    const { status, priority, label } = request.query
    const tasks = await taskService.listByUser(request.user.id, {
      status: status as TaskStatus | undefined,
      priority: priority as Priority | undefined,
      label,
    })
    return reply.send(tasks)
  })

  // ── POST /tasks ────────────────────────────────────────────────────────────
  app.post('/', async (request, reply) => {
    const result = createTaskSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: result.error.issues.map((i) => i.message).join(', '),
        code: 'VALIDATION_ERROR',
      })
    }

    const { createGithubIssue, repoId, dueDate, ...taskData } = result.data

    let githubIssueNumber: number | undefined
    let githubIssueUrl: string | undefined
    let syncStatus: 'LOCAL_ONLY' | 'SYNCED' = 'LOCAL_ONLY'

    if (createGithubIssue && repoId) {
      const repo = await prisma.gitHubRepo.findFirst({
        where: { id: repoId, userId: request.user.id },
      })
      if (repo) {
        const accessToken = decrypt(request.user.encryptedToken)
        const ghService = new GitHubService(accessToken)
        const issue = await ghService.createIssue(
          repo.owner,
          repo.name,
          taskData.title,
          taskData.description
        )
        githubIssueNumber = issue.number
        githubIssueUrl = issue.url
        syncStatus = 'SYNCED'
      }
    }

    const task = await taskService.create(request.user.id, {
      ...taskData,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      githubIssueNumber,
      githubIssueUrl,
      githubRepoId: repoId,
      syncStatus,
    })

    return reply.status(201).send(task)
  })

  // ── GET /tasks/:id ─────────────────────────────────────────────────────────
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const task = await taskService.getById(request.params.id, request.user.id)
    if (!task) {
      return reply.status(404).send({ error: 'Task not found', code: 'NOT_FOUND' })
    }
    return reply.send(task)
  })

  // ── PATCH /tasks/:id ───────────────────────────────────────────────────────
  app.patch<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const result = updateTaskSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: result.error.issues.map((i) => i.message).join(', '),
        code: 'VALIDATION_ERROR',
      })
    }

    const { dueDate, ...updateData } = result.data
    const existing = await taskService.getById(request.params.id, request.user.id)
    if (!existing) {
      return reply.status(404).send({ error: 'Task not found', code: 'NOT_FOUND' })
    }

    // If status changed to DONE and there is a linked issue, close it
    if (
      result.data.status === 'DONE' &&
      existing.status !== 'DONE' &&
      existing.githubIssueNumber &&
      existing.githubRepoId
    ) {
      const repo = await prisma.gitHubRepo.findUnique({
        where: { id: existing.githubRepoId },
      })
      if (repo) {
        try {
          const accessToken = decrypt(request.user.encryptedToken)
          const ghService = new GitHubService(accessToken)
          await ghService.closeIssue(repo.owner, repo.name, existing.githubIssueNumber)
        } catch {
          // Log but don't fail the update if GitHub call fails
          app.log.warn('Failed to close GitHub issue, marking as OUT_OF_SYNC')
          Object.assign(updateData, { syncStatus: 'OUT_OF_SYNC' })
        }
      }
    }

    const task = await taskService.updateAndReturn(
      request.params.id,
      request.user.id,
      {
        ...updateData,
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
      }
    )

    if (!task) {
      return reply.status(404).send({ error: 'Task not found', code: 'NOT_FOUND' })
    }

    return reply.send(task)
  })

  // ── DELETE /tasks/:id ──────────────────────────────────────────────────────
  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const task = await taskService.delete(request.params.id, request.user.id)
    if (!task) {
      return reply.status(404).send({ error: 'Task not found', code: 'NOT_FOUND' })
    }

    // Close linked GitHub issue if present
    if (task.githubIssueNumber && task.githubRepoId) {
      const repo = await prisma.gitHubRepo.findUnique({
        where: { id: task.githubRepoId },
      })
      if (repo) {
        try {
          const accessToken = decrypt(request.user.encryptedToken)
          const ghService = new GitHubService(accessToken)
          await ghService.closeIssue(repo.owner, repo.name, task.githubIssueNumber)
        } catch {
          app.log.warn('Failed to close GitHub issue on task delete')
        }
      }
    }

    return reply.status(204).send()
  })
}
