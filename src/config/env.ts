import * as z from 'zod'
import 'dotenv/config'

const createEnv = () => {
  const EnvSchema = z.object({
    API_URL: z.string(),
    APP_MOCK_API_PORT: z.string().optional().default('8080'),
    APP_URL: z.string().optional().default('http://localhost:3000'),
    ENABLE_API_MOCKING: z
      .string()
      .refine((s) => s === 'true' || s === 'false')
      .transform((s) => s === 'true')
      .optional(),
  })

  const envVars = {
    API_URL: process.env.NEXT_PUBLIC_API_URL,
    APP_MOCK_API_PORT: process.env.NEXT_PUBLIC_MOCK_API_PORT,
    APP_URL: process.env.NEXT_PUBLIC_URL,
    ENABLE_API_MOCKING: process.env.NEXT_PUBLIC_ENABLE_API_MOCKING,
  }

  const parsedEnv = EnvSchema.safeParse(envVars)

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
  The following variables are missing or invalid:
  ${Object.entries(parsedEnv.error.flatten().fieldErrors)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n')}
  `,
    )
  }

  return parsedEnv.data ?? {}
}

export const env = createEnv()
