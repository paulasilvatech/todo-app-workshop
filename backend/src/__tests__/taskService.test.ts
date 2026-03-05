// Mock Prisma before any imports
jest.mock('../lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

import { prisma } from '../lib/prisma'
import { taskService } from '../services/taskService'

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('taskService', () => {
  const userId = 'user_123'

  beforeEach(() => jest.clearAllMocks())

  describe('listByUser', () => {
    it('returns tasks filtered by userId', async () => {
      const tasks = [{ id: '1', title: 'Test', userId }]
      ;(mockPrisma.task.findMany as jest.Mock).mockResolvedValue(tasks)

      const result = await taskService.listByUser(userId, {})
      expect(result).toEqual(tasks)
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ userId }) })
      )
    })

    it('applies status filter', async () => {
      ;(mockPrisma.task.findMany as jest.Mock).mockResolvedValue([])
      await taskService.listByUser(userId, { status: 'DONE' })
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DONE' }),
        })
      )
    })
  })

  describe('getById', () => {
    it('returns task when found', async () => {
      const task = { id: 'task_1', userId }
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(task)
      const result = await taskService.getById('task_1', userId)
      expect(result).toEqual(task)
    })

    it('returns null when not found', async () => {
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(null)
      const result = await taskService.getById('missing', userId)
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('creates a task with userId', async () => {
      const input = { title: 'New task' }
      const created = { id: 'new_1', ...input, userId }
      ;(mockPrisma.task.create as jest.Mock).mockResolvedValue(created)

      const result = await taskService.create(userId, input)
      expect(result).toEqual(created)
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ userId, title: 'New task' }),
      })
    })
  })

  describe('delete', () => {
    it('returns null when task not owned by user', async () => {
      ;(mockPrisma.task.findFirst as jest.Mock).mockResolvedValue(null)
      const result = await taskService.delete('task_1', 'wrong_user')
      expect(result).toBeNull()
    })
  })
})
