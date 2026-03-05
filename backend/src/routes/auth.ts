import { FastifyPluginAsync } from 'fastify'
import { Octokit } from '@octokit/rest'
import { prisma } from '../lib/prisma'
import { encrypt } from '../lib/crypto'
import { config } from '../config'

// Minimal GitHub OAuth token response shape
interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  // ── Step 1: Redirect to GitHub ─────────────────────────────────────────────
  app.get('/github', async (_request, reply) => {
    const params = new URLSearchParams({
      client_id: config.GITHUB_CLIENT_ID,
      redirect_uri: `${config.BACKEND_URL}/auth/callback`,
      scope: 'user:email repo',
    })
    return reply.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`
    )
  })

  // ── Step 2: Handle OAuth callback ──────────────────────────────────────────
  app.get<{ Querystring: { code?: string; error?: string } }>(
    '/callback',
    async (request, reply) => {
      const { code, error } = request.query

      if (error || !code) {
        return reply.redirect(
          `${config.FRONTEND_URL}/login?error=oauth_denied`
        )
      }

      // Exchange code for token
      const tokenRes = await fetch(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            client_id: config.GITHUB_CLIENT_ID,
            client_secret: config.GITHUB_CLIENT_SECRET,
            code,
          }),
        }
      )

      if (!tokenRes.ok) {
        return reply.redirect(`${config.FRONTEND_URL}/login?error=token_exchange`)
      }

      const tokenData = (await tokenRes.json()) as GitHubTokenResponse

      if (!tokenData.access_token) {
        return reply.redirect(`${config.FRONTEND_URL}/login?error=no_token`)
      }

      // Fetch GitHub user info
      const octokit = new Octokit({ auth: tokenData.access_token })
      const { data: ghUser } = await octokit.users.getAuthenticated()

      // Upsert user in DB — token stored encrypted
      const user = await prisma.user.upsert({
        where: { githubId: ghUser.id },
        create: {
          githubId: ghUser.id,
          username: ghUser.login,
          avatarUrl: ghUser.avatar_url ?? null,
          encryptedToken: encrypt(tokenData.access_token),
        },
        update: {
          username: ghUser.login,
          avatarUrl: ghUser.avatar_url ?? null,
          encryptedToken: encrypt(tokenData.access_token),
        },
      })

      // Set signed session cookie (httpOnly, sameSite strict)
      reply.setCookie('session', user.id, {
        httpOnly: true,
        secure: config.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        signed: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return reply.redirect(`${config.FRONTEND_URL}/board`)
    }
  )

  // ── GET /auth/me ───────────────────────────────────────────────────────────
  app.get('/me', async (request, reply) => {
    // Auth guard attaches request.user for protected routes
    // /auth/me is not prefixed with a guard-exempt path, so it IS protected
    const sessionCookie = request.cookies['session']
    if (!sessionCookie) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'AUTH_REQUIRED' })
    }

    const { valid, value } = request.unsignCookie(sessionCookie)
    if (!valid || !value) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'INVALID_SESSION' })
    }

    const user = await prisma.user.findUnique({ where: { id: value } })
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', code: 'USER_NOT_FOUND' })
    }

    // Never return the encryptedToken
    return reply.send({
      id: user.id,
      githubId: user.githubId,
      username: user.username,
      avatarUrl: user.avatarUrl,
    })
  })

  // ── POST /auth/logout ──────────────────────────────────────────────────────
  app.post('/logout', async (_request, reply) => {
    reply.clearCookie('session', { path: '/' })
    return reply.status(204).send()
  })
}
