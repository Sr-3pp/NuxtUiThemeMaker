import type { UserLevel, UserPlan, UserPlanStatus } from '~/types/user-plan'

export interface AuthUser {
  id: string
  email: string
  name: string
  image?: string | null
  emailVerified: boolean
  level: UserLevel
  plan: UserPlan
  planStatus: UserPlanStatus
  stripeCustomerId?: string | null
  planExpiresAt?: string | Date | null
  createdAt: string
  updatedAt: string
}

export interface AuthSessionRecord {
  id: string
  userId: string
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: AuthUser
  session: AuthSessionRecord
}
