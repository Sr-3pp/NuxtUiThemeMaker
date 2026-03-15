interface PageSeoOptions {
  title: string
  description: string
  path?: string
  image?: string
  robots?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
}

function normalizeJsonLd(input: PageSeoOptions['jsonLd']) {
  if (!input) {
    return []
  }

  const items = Array.isArray(input) ? input : [input]

  return items.filter((item): item is Record<string, unknown> => {
    return Boolean(item && typeof item === 'object' && typeof item['@context'] === 'string')
  })
}

function joinUrl(base: string, path: string) {
  return new URL(path, base.endsWith('/') ? base : `${base}/`).toString()
}

export function usePageSeo(options: PageSeoOptions) {
  const route = useRoute()
  const requestUrl = useRequestURL()
  const config = useRuntimeConfig()
  const siteName = config.public.siteName
  const siteUrl = config.public.siteUrl
  const canonicalPath = options.path ?? route.path
  const canonical = joinUrl(siteUrl, canonicalPath)
  const socialImage = joinUrl(siteUrl, options.image ?? '/og-image.svg')
  const robots = options.robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
  const title = options.title
  const jsonLdEntries = normalizeJsonLd(options.jsonLd)

  useHead({
    title,
    titleTemplate: route.path === '/' ? `%s | ${siteName}` : `%s | ${siteName}`,
    link: [
      {
        rel: 'canonical',
        href: canonical,
      },
    ],
    script: jsonLdEntries.map((entry) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(entry),
    })),
  })

  useSeoMeta({
    title,
    description: options.description,
    robots,
    ogTitle: title,
    ogDescription: options.description,
    ogType: options.type ?? 'website',
    ogUrl: canonical,
    ogSiteName: siteName,
    ogLocale: 'en_US',
    ogImage: socialImage,
    ogImageAlt: `${title} preview`,
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: options.description,
    twitterImage: socialImage,
  })

  if (import.meta.server) {
    useServerSeoMeta({
      title,
      description: options.description,
      robots,
      ogTitle: title,
      ogDescription: options.description,
      ogType: options.type ?? 'website',
      ogUrl: canonical,
      ogSiteName: siteName,
      ogLocale: 'en_US',
      ogImage: socialImage,
      ogImageAlt: `${title} preview`,
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: options.description,
      twitterImage: socialImage,
    })
  }

  return {
    canonical,
    requestUrl,
    siteName,
    siteUrl,
  }
}
