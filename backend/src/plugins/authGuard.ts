import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma'

// Extend Fastify's request type to include the authenticated user
declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string
      githubId: number
      username: string
      avatarUrl: string | null
      encryptedToken: string
    }
  }
}

// Routes that bypass auth entirely
const PUBLIC_PREFIXES = ['/health', '/auth/', '/github/webhook']

function isPublicRoute(url: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => url.startsWith(prefix))
}

export const authGuard = fp(async (app) => {
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    if (isPublicRoute(request.url)) return

    const sessionCookie = request.cookies['session']
    if (!sessionCookie) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'AUTH_REQUIRED' })
    }

    // Verify the signed cookie
    const { valid, value } = request.unsignCookie(sessionCookie)
    if (!valid || !value) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'INVALID_SESSION' })
    }

    const userId = value
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'USER_NOT_FOUND' })
    }

    request.user = user
  })
}, { name: 'authGuard' })
