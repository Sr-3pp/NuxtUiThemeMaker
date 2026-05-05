import type { MaybeRefOrGetter } from 'vue'

export interface SeoRouteDefinition {
  path: string
  title: string
  description: string
  changefreq: 'daily' | 'weekly' | 'monthly'
  priority: string
}

export interface PageSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  path?: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string>
  robots?: MaybeRefOrGetter<string>
  type?: MaybeRefOrGetter<'website' | 'article'>
  jsonLd?: MaybeRefOrGetter<Record<string, unknown> | Array<Record<string, unknown>> | undefined>
}
