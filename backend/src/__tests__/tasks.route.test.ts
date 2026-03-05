// Mock Prisma
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    gitHubRepo: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

jest.mock('../services/githubService')

import { buildServer } from '../server'
import { prisma } from '../lib/prisma'
import { encrypt } from '../lib/crypto'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

const testUser = {
  id: 'user_test_123',
  githubId: 12345,
  username: 'testuser',
  avatarUrl: null,
  encryptedToken: encrypt('fake_token'),
}

async function getAuthCookie(app: Awaited<ReturnType<typeof buildServer>>) {
  // Directly sign the userId to simulate an active session
  const signed = app.signCookie(testUser.id)
  return `session=${signed}`
}

describe('Task Routes', () => {
  let app: Awaited<ReturnType<typeof buildServer>>

  beforeAll(async () => {
    app = await buildServer()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Auth guard: user lookup
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(testUser)
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /tasks', () => {
    it('returns 401 without session cookie', async () => {
      const res = await app.inject({ method: 'GET', url: '/tasks' })
      expect(res.statusCode).toBe(401)
      expect(JSON.parse(res.body)).toMatchObject({ code: 'AUTH_REQUIRED' })
    })

    it('returns 200 with valid session', async () => {
      ;(mockPrisma.task.findMany as jest.Mock).mockResolvedValue([])
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'GET',
        url: '/tasks',
        headers: { cookie },
      })
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toEqual([])
    })

    it('passes status filter to service', async () => {
      ;(mockPrisma.task.findMany as jest.Mock).mockResolvedValue([])
      const cookie = await getAuthCookie(app)
      await app.inject({
        method: 'GET',
        url: '/tasks?status=DONE',
        headers: { cookie },
      })
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DONE' }),
        })
      )
    })
  })

  describe('POST /tasks', () => {
    it('returns 401 without session', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'New task' },
      })
      expect(res.statusCode).toBe(401)
    })

    it('returns 400 when title is missing', async () => {
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'POST',
        url: '/tasks',
        headers: { cookie, 'content-type': 'application/json' },
        payload: { description: 'no title' },
      })
      expect(res.statusCode).toBe(400)
      expect(JSON.parse(res.body)).toMatchObject({ code: 'VALIDATION_ERROR' })
    })

    it('creates task and returns 201', async () => {
      const created = { id: 'task_1', title: 'New task', userId: testUser.id }
      ;(mockPrisma.task.create as jest.Mock).mockResolvedValue(created)
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'POST',
        url: '/tasks',
        headers: { cookie, 'content-type': 'application/json' },
        payload: { title: 'New task' },
      })
      expect(res.statusCode).toBe(201)
      expect(JSON.parse(res.body)).toMatchObject({ title: 'New task' })
    })
  })

  describe('GET /tasks/:id', () => {
    it('returns 404 for non-existent task', async () => {
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(null)
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'GET',
        url: '/tasks/nonexistent',
        headers: { cookie },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns task when found', async () => {
      const task = { id: 'task_1', title: 'Found', userId: testUser.id }
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(task)
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'GET',
        url: '/tasks/task_1',
        headers: { cookie },
      })
      expect(res.statusCode).toBe(200)
      expect(JSON.parse(res.body)).toMatchObject({ title: 'Found' })
    })
  })

  describe('DELETE /tasks/:id', () => {
    it('returns 404 when task not owned by user', async () => {
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(null)
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'DELETE',
        url: '/tasks/other_task',
        headers: { cookie },
      })
      expect(res.statusCode).toBe(404)
    })

    it('returns 204 on successful delete', async () => {
      const task = { id: 'task_1', title: 'To delete', userId: testUser.id, githubIssueNumber: null }
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(task)
      ;(mockPrisma.task.delete as jest.Mock).mockResolvedValue(task)
      const cookie = await getAuthCookie(app)
      const res = await app.inject({
        method: 'DELETE',
        url: '/tasks/task_1',
        headers: { cookie },
      })
      expect(res.statusCode).toBe(204)
    })
  })
})
