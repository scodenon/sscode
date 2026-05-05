import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({ quiet: true })

const EnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .refine(
      (v) => v.startsWith('postgresql://') || v.startsWith('postgres://'),
      'debe empezar con postgresql:// o postgres://',
    ),
  JWT_SECRET: z.string().min(20),
  PORT: z.coerce.number().optional(),
})

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  const message = parsed.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join(', ')
  throw new Error(`Entorno inválido: ${message}`)
}

export const env = parsed.data

process.env.DATABASE_URL = env.DATABASE_URL

