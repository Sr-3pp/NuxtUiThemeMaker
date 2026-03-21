import { createAuthClient } from 'better-auth/vue'
import type { BillingInterval, PricingPlanId } from '~/types/pricing'

export interface AuthClientUser {
  id: string
  createdAt: Date
  updatedAt: Date
  email: string
  emailVerified: boolean
  image?: string | null
  name: string
  aiPaletteGenerationsUsed: number
  isAdmin: boolean
  plan: PricingPlanId | 'free'
  planExpiresAt: Date | null
  planInterval: BillingInterval | null
  planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
}

export interface AuthClientSession {
  session: {
    id: string
    createdAt: Date
    updatedAt: Date
    expiresAt: Date
    token: string
    userId: string
  }
  user: AuthClientUser
}

export const authClient = createAuthClient({
  basePath: '/api/auth',
})
