jest.mock('../lib/prisma', () => ({
  prisma: {
    gitHubRepo: {
      findUnique: jest.fn(),
    },
    task: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}))

import crypto from 'crypto'
import { buildServer } from '../server'
import { prisma } from '../lib/prisma'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

function signPayload(payload: string, secret: string): string {
  return `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')}`
}

describe('GitHub Webhook', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeAll(async () => {
    app = await buildServer()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => jest.clearAllMocks())

  const webhookPayload = JSON.stringify({
    action: 'closed',
    issue: {
      number: 42,
      title: 'Test Issue',
      state: 'closed',
      html_url: 'https://github.com/octocat/repo/issues/42',
    },
    repository: {
      full_name: 'octocat/repo',
    },
  })

  it('returns 401 with missing signature', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/github/webhook',
      headers: { 'content-type': 'application/json' },
      body: webhookPayload,
    })
    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body)).toMatchObject({ code: 'WEBHOOK_AUTH_FAILED' })
  })

  it('returns 401 with invalid signature', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/github/webhook',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': 'sha256=badhash',
        'x-github-event': 'issues',
      },
      body: webhookPayload,
    })
    expect(res.statusCode).toBe(401)
  })

  it('returns 200 with valid signature and updates task on issues.closed', async () => {
    const signature = signPayload(webhookPayload, 'test_webhook_secret')

    ;(mockPrisma.gitHubRepo.findUnique as jest.Mock).mockResolvedValue({
      id: 'repo_1',
      owner: 'octocat',
      name: 'repo',
      fullName: 'octocat/repo',
      userId: 'user_1',
      user: { id: 'user_1' },
    })
    ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue({
      id: 'task_1',
      githubIssueNumber: 42,
      userId: 'user_1',
    })
    ;(mockPrisma.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 })

    const res = await app.inject({
      method: 'POST',
      url: '/github/webhook',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': signature,
        'x-github-event': 'issues',
      },
      body: webhookPayload,
    })

    expect(res.statusCode).toBe(200)
    expect(mockPrisma.task.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DONE', syncStatus: 'SYNCED' }),
      })
    )
  })

  it('returns 200 but skips update when repo is not tracked', async () => {
    const signature = signPayload(webhookPayload, 'test_webhook_secret')
    ;(mockPrisma.gitHubRepo.findUnique as jest.Mock).mockResolvedValue(null)

    const res = await app.inject({
      method: 'POST',
      url: '/github/webhook',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': signature,
        'x-github-event': 'issues',
      },
      body: webhookPayload,
    })

    expect(res.statusCode).toBe(200)
    expect(mockPrisma.task.updateMany).not.toHaveBeenCalled()
  })

  it('returns 200 for non-issues events without processing', async () => {
    const payload = JSON.stringify({ action: 'starred' })
    const signature = signPayload(payload, 'test_webhook_secret')

    const res = await app.inject({
      method: 'POST',
      url: '/github/webhook',
      headers: {
        'content-type': 'application/json',
        'x-hub-signature-256': signature,
        'x-github-event': 'star',
      },
      body: payload,
    })

    expect(res.statusCode).toBe(200)
    expect(mockPrisma.task.updateMany).not.toHaveBeenCalled()
  })
})
