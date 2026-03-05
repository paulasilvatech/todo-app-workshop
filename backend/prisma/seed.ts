import { PrismaClient, TaskStatus, Priority } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Minimal encrypt for seeding (mirrors src/lib/crypto.ts logic without importing it)
function seedEncrypt(plaintext: string): string {
  const key = Buffer.from(
    process.env.TOKEN_ENCRYPTION_KEY ??
      'a'.repeat(64), // fallback for seed-only usage
    'hex'
  )
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, {
    authTagLength: 16,
  })
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':')
}

const sampleTasks: Array<{
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  labels: string[]
  assignee: string
}> = [
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated tests and deployment',
    status: 'TODO',
    priority: 'HIGH',
    labels: ['devops', 'automation'],
    assignee: 'demo-user',
  },
  {
    title: 'Write unit tests for auth service',
    description: 'Add Jest tests covering OAuth flow and session management',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    labels: ['testing', 'backend'],
    assignee: 'demo-user',
  },
  {
    title: 'Design system color tokens',
    description: 'Define CSS custom properties for the design system palette',
    status: 'DONE',
    priority: 'MEDIUM',
    labels: ['design', 'frontend'],
    assignee: 'demo-user',
  },
  {
    title: 'Implement keyboard shortcuts',
    description: 'Add n for new task and Cmd+K for search',
    status: 'TODO',
    priority: 'LOW',
    labels: ['ux', 'frontend'],
    assignee: 'demo-user',
  },
  {
    title: 'Add Prisma migrations to CI',
    description: 'Run prisma migrate deploy before each deployment',
    status: 'TODO',
    priority: 'MEDIUM',
    labels: ['devops', 'database'],
    assignee: 'demo-user',
  },
  {
    title: 'Write API documentation',
    description: 'Document all REST endpoints with OpenAPI / Swagger',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    labels: ['documentation'],
    assignee: '',
  },
  {
    title: 'Optimize task list query',
    description: 'Ensure indexes on userId+status are used by EXPLAIN ANALYZE',
    status: 'DONE',
    priority: 'MEDIUM',
    labels: ['performance', 'backend'],
    assignee: 'demo-user',
  },
  {
    title: 'Build drag-and-drop Kanban board',
    description: 'Implement @dnd-kit with DndContext and SortableContext',
    status: 'DONE',
    priority: 'HIGH',
    labels: ['frontend', 'ux'],
    assignee: 'demo-user',
  },
  {
    title: 'Add GitHub webhook support',
    description: 'Verify HMAC-SHA256 signature and handle issues events',
    status: 'TODO',
    priority: 'HIGH',
    labels: ['backend', 'integration'],
    assignee: 'demo-user',
  },
  {
    title: 'Accessibility audit',
    description: 'Ensure WCAG 2.1 AA compliance — add ARIA labels and keyboard navigation',
    status: 'TODO',
    priority: 'MEDIUM',
    labels: ['accessibility', 'frontend'],
    assignee: '',
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Create a demo user (uses a fake GitHub ID — replace with real one for OAuth)
  const user = await prisma.user.upsert({
    where: { githubId: 99999999 },
    create: {
      githubId: 99999999,
      username: 'demo-user',
      avatarUrl: 'https://avatars.githubusercontent.com/u/99999999',
      encryptedToken: seedEncrypt('demo_github_token'),
    },
    update: {},
  })

  console.log(`   User upserted: ${user.username} (${user.id})`)

  // Clear existing seed tasks for this user to allow idempotent seeding
  await prisma.task.deleteMany({ where: { userId: user.id } })

  for (const task of sampleTasks) {
    await prisma.task.create({
      data: { ...task, userId: user.id },
    })
  }

  console.log(`   Created ${sampleTasks.length} sample tasks`)
  console.log('✅ Seed complete')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
