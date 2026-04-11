import { MongoClient } from 'mongodb'

declare global {
  var __nuxtUiThemeMakerMongoClient__: MongoClient | undefined
  var __nuxtUiThemeMakerMongoClientPromise__: Promise<MongoClient> | undefined
}

export async function getMongoClient() {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri

  if (!uri) {
    throw new Error('Missing MONGODB_URI runtime config')
  }

  if (!globalThis.__nuxtUiThemeMakerMongoClient__) {
    globalThis.__nuxtUiThemeMakerMongoClient__ = new MongoClient(uri)
  }

  const client = globalThis.__nuxtUiThemeMakerMongoClient__

  if (!client) {
    throw new Error('Failed to initialize MongoDB client')
  }

  if (!globalThis.__nuxtUiThemeMakerMongoClientPromise__) {
    globalThis.__nuxtUiThemeMakerMongoClientPromise__ = client.connect()
  }

  await globalThis.__nuxtUiThemeMakerMongoClientPromise__

  return client
}

export async function getMongoDb() {
  const config = useRuntimeConfig()
  const client = await getMongoClient()

  return client.db(config.mongodbDbName)
}
