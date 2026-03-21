export interface PageSeoOptions {
  title: string
  description: string
  path?: string
  image?: string
  robots?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}
