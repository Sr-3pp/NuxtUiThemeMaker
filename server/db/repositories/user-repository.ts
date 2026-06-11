import { ObjectId } from 'mongodb'
import type { UpdateFilter } from 'mongodb'
import type { PricingPlanId } from '~/types/pricing'
import { getMongoDb } from '~~/server/utils/mongodb'

export const USER_COLLECTIONS = ['user', 'users'] as const
type BillingInterval = 'monthly' | 'yearly'
interface UserDocument extends Record<string, unknown> {
  _id?: ObjectId | string
  id?: string
  email?: string
  name?: string
  plan?: PricingPlanId | 'free'
  planExpiresAt?: Date | null
  planInterval?: BillingInterval | null
  stripeSubscriptionId?: string | null
  aiPaletteGenerationsUsed?: number
}

function getUserFilters(userId: string) {
  const filters: UserDocument[] = [
    { id: userId },
    { _id: userId },
  ]

  if (ObjectId.isValid(userId)) {
    filters.push({ _id: new ObjectId(userId) })
  }

  return filters
}

function getFindOneAndUpdateDocument(result: unknown): UserDocument | null {
  if (!result) {
    return null
  }

  if (typeof result === 'object' && 'value' in result) {
    return (result.value as UserDocument | null | undefined) ?? null
  }

  return result as UserDocument
}

function getUserDocumentKey(document: UserDocument) {
  return String(document.id ?? document._id)
}

function sortUserDocuments(
  documents: UserDocument[],
  sort: Record<string, 1 | -1> | undefined,
) {
  const [sortEntry] = Object.entries(sort ?? {})

  if (!sortEntry) {
    return documents
  }

  const [field, direction] = sortEntry

  return [...documents].sort((left, right) => {
    const leftValue = left[field]
    const rightValue = right[field]

    if (leftValue instanceof Date && rightValue instanceof Date) {
      return (leftValue.getTime() - rightValue.getTime()) * direction
    }

    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
      return leftValue.localeCompare(rightValue) * direction
    }

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction
    }

    return 0
  })
}

export async function listUserDocuments(
  options?: {
    filter?: Record<string, unknown>
    projection?: Record<string, 0 | 1>
    sort?: Record<string, 1 | -1>
  },
): Promise<Record<string, unknown>[]> {
  const db = await getMongoDb()
  const usersById = new Map<string, UserDocument>()

  for (const collectionName of USER_COLLECTIONS) {
    const documents = await db.collection<UserDocument>(collectionName)
      .find(options?.filter ?? {}, {
        projection: options?.projection,
      })
      .sort(options?.sort ?? {})
      .toArray()

    for (const document of documents) {
      usersById.set(getUserDocumentKey(document), {
        ...usersById.get(getUserDocumentKey(document)),
        ...document,
      })
    }
  }

  return sortUserDocuments(Array.from(usersById.values()), options?.sort)
}

export async function incrementAiPaletteGenerationsUsed(userId: string) {
  const db = await getMongoDb()
  const filters = getUserFilters(userId)
  const usageIncrement = { $inc: { aiPaletteGenerationsUsed: 1 } } as unknown as UpdateFilter<UserDocument>
  let updatedUser: UserDocument | null = null

  for (const collectionName of USER_COLLECTIONS) {
    const result = await db.collection<UserDocument>(collectionName).findOneAndUpdate(
      { $or: filters },
      usageIncrement,
      {
        returnDocument: 'after',
      },
    )
    const document = getFindOneAndUpdateDocument(result)

    if (document) {
      updatedUser = document
    }
  }

  return updatedUser
}

async function updateUserAcrossCollections(
  userId: string,
  update: UserDocument,
) {
  const db = await getMongoDb()
  const filters = getUserFilters(userId)

  for (const collectionName of USER_COLLECTIONS) {
    for (const filter of filters) {
      const result = await db.collection<UserDocument>(collectionName).findOneAndUpdate(
        filter,
        { $set: update },
        {
          returnDocument: 'after',
        },
      )

      const document = getFindOneAndUpdateDocument(result)

      if (document) {
        return document
      }
    }
  }

  return null
}

export async function findUserById(userId: string) {
  const db = await getMongoDb()
  const filters = getUserFilters(userId)

  for (const collectionName of USER_COLLECTIONS) {
    for (const filter of filters) {
      const document = await db.collection<UserDocument>(collectionName).findOne(filter)

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
    const document = await db.collection<UserDocument>(collectionName).findOne({ email })

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
    plan: PricingPlanId
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

export async function updateEmailDeliveryForUser(
  userId: string,
  input: {
    lastPurchaseConfirmationId?: string | null
    registrationConfirmationSentAt?: Date | null
  },
) {
  return updateUserAcrossCollections(userId, {
    ...(input.lastPurchaseConfirmationId !== undefined ? { lastPurchaseConfirmationId: input.lastPurchaseConfirmationId } : {}),
    ...(input.registrationConfirmationSentAt !== undefined ? { registrationConfirmationSentAt: input.registrationConfirmationSentAt } : {}),
  })
}

export async function findUserByStripeCustomerId(stripeCustomerId: string) {
  const db = await getMongoDb()

  for (const collectionName of USER_COLLECTIONS) {
    const document = await db.collection<UserDocument>(collectionName).findOne({ stripeCustomerId })

    if (document) {
      return document
    }
  }

  return null
}

export async function migrateLegacyUserAdminFields() {
  const db = await getMongoDb()

  for (const collectionName of USER_COLLECTIONS) {
    const collection = db.collection(collectionName)

    await collection.updateMany(
      {
        level: 'admin',
        isAdmin: {
          $ne: true,
        },
      },
      {
        $set: {
          isAdmin: true,
        },
      },
    )

    await collection.updateMany(
      {
        isAdmin: {
          $exists: false,
        },
        level: {
          $ne: 'admin',
        },
      },
      {
        $set: {
          isAdmin: false,
        },
      },
    )

    await collection.updateMany(
      {
        level: {
          $exists: true,
        },
      },
      {
        $unset: {
          level: '',
        },
      },
    )
  }
}
