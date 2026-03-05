import { FastifyPluginAsync } from 'fastify'
import crypto from 'crypto'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { decrypt } from '../lib/crypto'
import { GitHubService } from '../services/githubService'
import { taskService } from '../services/taskService'
import { config } from '../config'

const connectRepoSchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
})

function verifyWebhookSignature(
  payload: string,
  signature: string | undefined
): boolean {
  if (!signature) return false

  const expected = `sha256=${crypto
    .createHmac('sha256', config.GITHUB_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex')}`

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expected, 'utf8')
    )
  } catch {
    return false
  }
}

export const githubRoutes: FastifyPluginAsync = async (app) => {
  // ── POST /github/webhook — PUBLIC, HMAC-verified ───────────────────────────
  app.post(
    '/webhook',
    async (request, reply) => {
      const signature = request.headers['x-hub-signature-256'] as string | undefined
      const rawBody = request.rawBody ?? JSON.stringify(request.body)

      if (!verifyWebhookSignature(rawBody, signature)) {
        return reply.status(401).send({ error: 'Invalid signature', code: 'WEBHOOK_AUTH_FAILED' })
      }

      const event = request.headers['x-github-event'] as string
      if (event !== 'issues') {
        return reply.status(200).send({ received: true })
      }

      const body = request.body as {
        action: string
        issue: { number: number; title: string; state: string; html_url: string }
        repository: { full_name: string }
      }

      const { action, issue, repository } = body

      // Find which user owns a repo with this full_name
      const repo = await prisma.gitHubRepo.findUnique({
        where: { fullName: repository.full_name },
        include: { user: true },
      })

      if (!repo) {
        return reply.status(200).send({ received: true, note: 'repo not tracked' })
      }

      const task = await taskService.findByGithubIssue(issue.number, repo.userId)
      if (!task) {
        return reply.status(200).send({ received: true, note: 'task not found' })
      }

      if (action === 'closed') {
        await taskService.update(task.id, repo.userId, {
          status: 'DONE',
          syncStatus: 'SYNCED',
        })
      } else if (action === 'edited') {
        await taskService.update(task.id, repo.userId, {
          title: issue.title,
          syncStatus: 'SYNCED',
        })
      } else if (action === 'reopened') {
        await taskService.update(task.id, repo.userId, {
          status: 'TODO',
          syncStatus: 'SYNCED',
        })
      }

      return reply.status(200).send({ received: true })
    }
  )

  // All routes below require authentication (enforced by authGuard hook)

  // ── GET /github/repos ──────────────────────────────────────────────────────
  app.get('/repos', async (request, reply) => {
    const accessToken = decrypt(request.user.encryptedToken)
    const ghService = new GitHubService(accessToken)
    const repos = await ghService.listRepos()
    return reply.send(repos)
  })

  // ── POST /github/repos — Connect a repo ────────────────────────────────────
  app.post('/repos', async (request, reply) => {
    const result = connectRepoSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({
        error: result.error.issues.map((i) => i.message).join(', '),
        code: 'VALIDATION_ERROR',
      })
    }

    const { owner, name, fullName } = result.data

    const repo = await prisma.gitHubRepo.upsert({
      where: { fullName },
      create: { owner, name, fullName, userId: request.user.id },
      update: { owner, name },
    })

    return reply.status(201).send(repo)
  })

  // ── GET /github/connected-repos — List user's connected repos ──────────────
  app.get('/connected-repos', async (request, reply) => {
    const repos = await prisma.gitHubRepo.findMany({
      where: { userId: request.user.id },
    })
    return reply.send(repos)
  })

  // ── DELETE /github/repos/:id — Disconnect a repo ───────────────────────────
  app.delete<{ Params: { id: string } }>('/repos/:id', async (request, reply) => {
    const repo = await prisma.gitHubRepo.findFirst({
      where: { id: request.params.id, userId: request.user.id },
    })
    if (!repo) {
      return reply.status(404).send({ error: 'Repo not found', code: 'NOT_FOUND' })
    }
    await prisma.gitHubRepo.delete({ where: { id: repo.id } })
    return reply.status(204).send()
  })

  // ── POST /github/repos/:repoId/import — Import open issues as tasks ────────
  app.post<{ Params: { repoId: string } }>(
    '/repos/:repoId/import',
    async (request, reply) => {
      const repo = await prisma.gitHubRepo.findFirst({
        where: { id: request.params.repoId, userId: request.user.id },
      })
      if (!repo) {
        return reply.status(404).send({ error: 'Repo not found', code: 'NOT_FOUND' })
      }

      const accessToken = decrypt(request.user.encryptedToken)
      const ghService = new GitHubService(accessToken)
      const issues = await ghService.listOpenIssues(repo.owner, repo.name)

      let imported = 0
      for (const issue of issues) {
        const existing = await taskService.findByGithubIssue(
          issue.number,
          request.user.id
        )
        if (!existing) {
          await taskService.create(request.user.id, {
            title: issue.title,
            description: issue.body,
            labels: issue.labels,
            githubIssueNumber: issue.number,
            githubIssueUrl: issue.url,
            githubRepoId: repo.id,
            syncStatus: 'SYNCED',
          })
          imported++
        }
      }

      return reply.send({ imported, total: issues.length })
    }
  )

  // ── GET /github/sync — Reconcile OUT_OF_SYNC tasks ─────────────────────────
  app.get('/sync', async (request, reply) => {
    const staleTasks = await taskService.getOutOfSyncTasks(request.user.id)
    const accessToken = decrypt(request.user.encryptedToken)
    const ghService = new GitHubService(accessToken)

    let synced = 0
    for (const task of staleTasks) {
      if (!task.githubIssueNumber || !task.githubRepoId) continue

      const repo = await prisma.gitHubRepo.findUnique({
        where: { id: task.githubRepoId },
      })
      if (!repo) continue

      try {
        const issue = await ghService.getIssue(
          repo.owner,
          repo.name,
          task.githubIssueNumber
        )

        await taskService.update(task.id, request.user.id, {
          title: issue.title,
          status: issue.state === 'closed' ? 'DONE' : task.status,
          syncStatus: 'SYNCED',
        })
        synced++
      } catch {
        app.log.warn(`Failed to sync task ${task.id}`)
      }
    }

    return reply.send({ synced, total: staleTasks.length })
  })
}
