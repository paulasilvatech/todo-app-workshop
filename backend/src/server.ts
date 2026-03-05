import Fastify, { FastifyRequest } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import { config } from './config'
import { healthRoutes } from './routes/health'
import { authRoutes } from './routes/auth'
import { taskRoutes } from './routes/tasks'
import { githubRoutes } from './routes/github'
import { authGuard } from './plugins/authGuard'

// Extend FastifyRequest to carry raw body for webhook HMAC verification
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: string
  }
}

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'test' ? 'silent' : 'info',
      transport:
        config.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // ── Plugins ────────────────────────────────────────────────────────────────
  await app.register(fastifyCors, {
    origin: config.FRONTEND_URL,
    credentials: true,
  })

  await app.register(fastifyCookie, {
    secret: config.SESSION_SECRET,
    hook: 'onRequest',
  })

  // Capture raw body for webhook HMAC verification on the webhook route
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'string' },
    (req: FastifyRequest, body: string, done) => {
      req.rawBody = body
      try {
        done(null, JSON.parse(body))
      } catch (err) {
        done(err as Error, undefined)
      }
    }
  )

  // ── Routes ─────────────────────────────────────────────────────────────────
  // Public routes (no auth required)
  await app.register(healthRoutes)
  await app.register(authRoutes, { prefix: '/auth' })

  // Webhook must be public but HMAC-verified (registered before authGuard)
  await app.register(githubRoutes, { prefix: '/github' })

  // Auth guard — attaches request.user to all routes registered after
  await app.register(authGuard)

  // Protected routes
  await app.register(taskRoutes, { prefix: '/tasks' })

  return app
}

async function main() {
  let app: Awaited<ReturnType<typeof buildServer>>

  try {
    app = await buildServer()
  } catch (err) {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  }

  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' })
    app.log.info(`Server listening on port ${config.PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

// Only execute when run directly — not when imported by tests
if (require.main === module) {
  main()
}
