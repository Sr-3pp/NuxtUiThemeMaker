interface PageSeoOptions {
  title: string
  description: string
  path?: string
  image?: string
  robots?: string
  type?: 'website' | 'article'
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>
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

  useHead({
    title,
    titleTemplate: route.path === '/' ? `%s | ${siteName}` : `%s | ${siteName}`,
    link: [
      {
        rel: 'canonical',
        href: canonical,
      },
    ],
    script: options.jsonLd
      ? [
          {
            type: 'application/ld+json',
            children: JSON.stringify(options.jsonLd),
          },
        ]
      : [],
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
