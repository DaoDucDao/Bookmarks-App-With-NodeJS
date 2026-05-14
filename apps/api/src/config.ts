import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(2607),
  DATABASE_PATH: z.string().min(1).default('data.db'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  SESSION_SECRET: z.string().min(16).default('dev-only-secret-change-me-please'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:')
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

export const config = parsed.data
export type Config = z.infer<typeof envSchema>
