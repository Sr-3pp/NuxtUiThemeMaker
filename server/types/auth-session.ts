import type { getAuth } from '~~/server/utils/auth'

type RawAuthSession = NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof getAuth>>['api']['getSession']>>>

export type AuthSessionUser = RawAuthSession['user'] & {
  level: 'user' | 'admin'
  plan: 'free' | 'pro' | 'team'
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  stripeCustomerId: string | null
  planExpiresAt: Date | null
  aiPaletteGenerationsUsed: number
}

export type AuthSession = Omit<RawAuthSession, 'user'> & {
  user: AuthSessionUser
}
