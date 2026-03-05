import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  GITHUB_CLIENT_ID: z.string().optional().default(''),
  GITHUB_CLIENT_SECRET: z.string().optional().default(''),
  GITHUB_WEBHOOK_SECRET: z.string().optional().default(''),
  TOKEN_ENCRYPTION_KEY: z
    .string()
    .length(64, 'TOKEN_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)'),
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),
  BACKEND_URL: z.string().url('BACKEND_URL must be a valid URL'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const messages = parsed.error.issues
    .map((issue) => `   ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  // Throw so Jest can catch it gracefully; server.ts main() calls process.exit on this error
  throw new Error(`❌ Invalid environment variables:\n${messages}`)
}

export const config = parsed.data
export type Config = typeof config

/** True when GitHub OAuth credentials are not configured */
export const skipAuth =
  !config.GITHUB_CLIENT_ID || config.GITHUB_CLIENT_ID === 'your_github_client_id_here'
