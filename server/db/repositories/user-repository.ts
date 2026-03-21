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
