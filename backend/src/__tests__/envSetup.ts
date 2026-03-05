/**
 * Jest globalSetup — runs before any test module is loaded.
 * All env vars required by config.ts must be set here.
 */
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/todoapp_test'
process.env.TOKEN_ENCRYPTION_KEY = 'a'.repeat(64)
process.env.GITHUB_CLIENT_ID = 'test_client_id'
process.env.GITHUB_CLIENT_SECRET = 'test_client_secret'
process.env.GITHUB_WEBHOOK_SECRET = 'test_webhook_secret'
process.env.SESSION_SECRET = 'test_session_secret_at_least_32_chars_long'
process.env.BACKEND_URL = 'http://localhost:3001'
process.env.FRONTEND_URL = 'http://localhost:5173'
process.env.NODE_ENV = 'test'
