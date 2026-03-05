import { prisma } from '../lib/prisma'
import { TaskStatus, Priority, SyncStatus } from '@prisma/client'

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  dueDate?: Date
  labels?: string[]
  assignee?: string
  githubIssueNumber?: number
  githubIssueUrl?: string
  githubRepoId?: string
  syncStatus?: SyncStatus
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: Priority
  dueDate?: Date | null
  labels?: string[]
  assignee?: string | null
  syncStatus?: SyncStatus
  githubIssueNumber?: number
  githubIssueUrl?: string
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: Priority
  label?: string
}

export const taskService = {
  async listByUser(userId: string, filters: TaskFilters) {
    return prisma.task.findMany({
      where: {
        userId,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.label ? { labels: { has: filters.label } } : {}),
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId },
    })
  },

  async create(userId: string, data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        ...data,
        userId,
      },
    })
  },

  async update(id: string, userId: string, data: UpdateTaskInput) {
    return prisma.task.updateMany({
      where: { id, userId },
      data,
    })
  },

  async updateAndReturn(id: string, userId: string, data: UpdateTaskInput) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.task.findFirst({ where: { id, userId } })
      if (!existing) return null

      return tx.task.update({
        where: { id },
        data,
      })
    })
  },

  async delete(id: string, userId: string) {
    const task = await prisma.task.findFirst({ where: { id, userId } })
    if (!task) return null

    await prisma.task.delete({ where: { id } })
    return task
  },

  async findByGithubIssue(githubIssueNumber: number, userId: string) {
    return prisma.task.findFirst({
      where: { githubIssueNumber, userId },
    })
  },

  async getOutOfSyncTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        userId,
        syncStatus: 'OUT_OF_SYNC',
        githubIssueNumber: { not: null },
      },
    })
  },
}
