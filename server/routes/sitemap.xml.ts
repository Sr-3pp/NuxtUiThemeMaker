import { listPublicPalettes } from '~~/server/db/repositories/palette-repository'
import { indexableSeoRoutes } from '~~/app/utils/seo'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = config.public.siteUrl.endsWith('/')
    ? config.public.siteUrl
    : `${config.public.siteUrl}/`
  const publicPalettes = await listPublicPalettes()

  const generatedAt = new Date().toISOString()
  const urls = [
    ...indexableSeoRoutes.map(route => ({
      loc: new URL(route.path, siteUrl).toString(),
      lastmod: generatedAt,
      changefreq: route.changefreq,
      priority: route.priority,
    })),
    ...publicPalettes.map((palette) => ({
      loc: new URL(`/palette/${palette.slug}`, siteUrl).toString(),
      lastmod: palette.updatedAt.toISOString(),
      changefreq: 'weekly',
      priority: '0.7',
    })),
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${escapeXml(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return xml
})
