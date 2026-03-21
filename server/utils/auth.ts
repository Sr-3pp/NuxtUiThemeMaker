import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { z } from 'zod'
import { migrateLegacyUserAdminFields } from '~~/server/db/repositories/user-repository'
import { getMongoClient, getMongoDb } from './mongodb'

function createAuthInstance(options: Parameters<typeof betterAuth>[0]) {
  return betterAuth(options)
}

let authInstance: ReturnType<typeof createAuthInstance> | null = null
let authSetupPromise: Promise<void> | null = null

const planSchema = z.enum(['free', 'pro', 'team'])
const planStatusSchema = z.enum(['inactive', 'trialing', 'active', 'past_due', 'canceled'])
const billingIntervalSchema = z.enum(['monthly', 'yearly'])

function parseList(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map(entry => entry.trim()).filter(Boolean)
  }

  return String(value ?? '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
}

export async function getAuth() {
  if (authInstance) {
    if (authSetupPromise) {
      await authSetupPromise
    }

    return authInstance
  }

  const config = useRuntimeConfig()
  const db = await getMongoDb()
  const client = await getMongoClient()
  const secret = config.betterAuthSecret
  const trustedOrigins = parseList(config.betterAuthTrustedOrigins)
  const allowedHosts = Array.from(new Set([
    ...parseList(config.betterAuthAllowedHosts),
    'localhost:3000',
    '127.0.0.1:3000',
    '*.vercel.app',
  ]))
  const trustedOriginPatterns = Array.from(new Set([
    ...trustedOrigins,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://*.vercel.app',
  ]))

  if (!secret) {
    throw new Error('Missing BETTER_AUTH_SECRET runtime config')
  }

  authInstance = createAuthInstance({
    secret,
    baseURL: {
      allowedHosts,
      fallback: config.betterAuthUrl,
      protocol: 'auto',
    },
    basePath: '/api/auth',
    trustedOrigins: trustedOriginPatterns,
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        isAdmin: {
          type: 'boolean',
          defaultValue: false,
          input: false,
          validator: {
            output: z.boolean(),
          },
        },
        plan: {
          type: 'string',
          defaultValue: 'free',
          input: false,
          validator: {
            output: planSchema,
          },
        },
        planStatus: {
          type: 'string',
          defaultValue: 'inactive',
          input: false,
          validator: {
            output: planStatusSchema,
          },
        },
        stripeCustomerId: {
          type: 'string',
          required: false,
          defaultValue: null,
          input: false,
          validator: {
            output: z.nullable(z.string()),
          },
        },
        stripeSubscriptionId: {
          type: 'string',
          required: false,
          defaultValue: null,
          input: false,
          validator: {
            output: z.nullable(z.string()),
          },
        },
        planExpiresAt: {
          type: 'date',
          required: false,
          defaultValue: null,
          input: false,
          validator: {
            output: z.nullable(z.date()),
          },
        },
        planInterval: {
          type: 'string',
          required: false,
          defaultValue: null,
          input: false,
          validator: {
            output: z.nullable(billingIntervalSchema),
          },
        },
        aiPaletteGenerationsUsed: {
          type: 'number',
          defaultValue: 0,
          input: false,
          validator: {
            output: z.number().int().min(0),
          },
        },
      },
    },
    database: mongodbAdapter(db, {
      client,
    }),
    rateLimit: {
      enabled: true,
    },
  })

  authSetupPromise ??= migrateLegacyUserAdminFields()
    .catch((error) => {
      authSetupPromise = null
      throw error
    })

  await authSetupPromise

  return authInstance
}
