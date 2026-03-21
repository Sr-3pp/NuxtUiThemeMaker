import { ObjectId } from 'mongodb'
import { getMongoDb } from '~~/server/utils/mongodb'

const USER_COLLECTIONS = ['user', 'users'] as const

function getUserFilters(userId: string) {
  const filters: Record<string, unknown>[] = [
    { id: userId },
    { _id: userId },
  ]

  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) })
  }

  return filters
}

export async function incrementAiPaletteGenerationsUsed(userId: string) {
  const db = await getMongoDb()
  const filters = getUserFilters(userId)

  for (const collectionName of USER_COLLECTIONS) {
    for (const filter of filters) {
      const result = await db.collection(collectionName).findOneAndUpdate(
        filter,
        { $inc: { aiPaletteGenerationsUsed: 1 } },
        {
          returnDocument: 'after',
        },
      )

      if (!result) {
        continue
      }

      if (typeof result === 'object' && 'value' in result) {
        if (result.value) {
          return result.value
        }

        continue
      }

      return result
    }
  }

  return null
}

async function updateUserAcrossCollections(
  userId: string,
  update: Record<string, unknown>,
) {
  const db = await getMongoDb()
  const filters = getUserFilters(userId)

  for (const collectionName of USER_COLLECTIONS) {
    for (const filter of filters) {
      const result = await db.collection(collectionName).findOneAndUpdate(
        filter,
        { $set: update },
        {
          returnDocument: 'after',
        },
      )

      if (!result) {
        continue
      }

      if (typeof result === 'object' && 'value' in result) {
        if (result.value) {
          return result.value
        }

        continue
      }

      return result
    }
  }

  return null
}

export async function findUserById(userId: string) {
  const db = await getMongoDb()
  const filters = getUserFilters(userId)

  for (const collectionName of USER_COLLECTIONS) {
    for (const filter of filters) {
      const document = await db.collection(collectionName).findOne(filter)

      if (document) {
        return document
      }
    }
  }

  return null
}

export async function findUserByEmail(email: string) {
  const db = await getMongoDb()

  for (const collectionName of USER_COLLECTIONS) {
    const document = await db.collection(collectionName).findOne({ email })

    if (document) {
      return document
    }
  }

  return null
}

export async function updateStripeCustomerForUser(userId: string, stripeCustomerId: string) {
  return updateUserAcrossCollections(userId, {
    stripeCustomerId,
  })
}

export async function updateBillingPlanForUser(
  userId: string,
  input: {
    plan: 'free' | 'pro' | 'team'
    planStatus: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled'
    planExpiresAt: Date | null
    planInterval?: 'monthly' | 'yearly' | null
    stripeCustomerId?: string | null
    stripeSubscriptionId?: string | null
  },
) {
  return updateUserAcrossCollections(userId, {
    plan: input.plan,
    planStatus: input.planStatus,
    planExpiresAt: input.planExpiresAt,
    ...(input.planInterval !== undefined ? { planInterval: input.planInterval } : {}),
    ...(input.stripeCustomerId !== undefined ? { stripeCustomerId: input.stripeCustomerId } : {}),
    ...(input.stripeSubscriptionId !== undefined ? { stripeSubscriptionId: input.stripeSubscriptionId } : {}),
  })
}

export async function findUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getMongoDb()

  for (const collectionName of USER_COLLECTIONS) {
    const document = await db.collection(collectionName).findOne({ stripeCustomerId })

    if (document) {
      return document
    }
  }

  return null
}
