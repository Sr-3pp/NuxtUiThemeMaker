import { toValue } from 'vue'
import type { PageSeoOptions } from '~/types/seo'

function normalizeJsonLd(input: PageSeoOptions['jsonLd']) {
  const value = toValue(input)

  if (!value) {
    return []
  }

  const items = Array.isArray(value) ? value : [value]

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
  const title = computed(() => toValue(options.title))
  const description = computed(() => toValue(options.description))
  const canonicalPath = computed(() => toValue(options.path) ?? route.path)
  const canonical = computed(() => joinUrl(siteUrl, canonicalPath.value))
  const socialImage = computed(() => joinUrl(siteUrl, toValue(options.image) ?? '/og-image.svg'))
  const robots = computed(() => toValue(options.robots) ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
  const ogType = computed(() => toValue(options.type) ?? 'website')
  const jsonLdEntries = computed(() => normalizeJsonLd(options.jsonLd))

  useHead(() => ({
    title: title.value,
    titleTemplate: `%s | ${siteName}`,
    link: [
      {
        rel: 'canonical',
        href: canonical.value,
      },
    ],
    script: jsonLdEntries.value.map((entry) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(entry),
    })),
  }))

  useSeoMeta({
    title,
    description,
    robots,
    ogTitle: title,
    ogDescription: description,
    ogType,
    ogUrl: canonical,
    ogSiteName: siteName,
    ogLocale: 'en_US',
    ogImage: socialImage,
    ogImageAlt: computed(() => `${title.value} preview`),
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: socialImage,
  })

  if (import.meta.server) {
    useServerSeoMeta({
      title,
      description,
      robots,
      ogTitle: title,
      ogDescription: description,
      ogType,
      ogUrl: canonical,
      ogSiteName: siteName,
      ogLocale: 'en_US',
      ogImage: socialImage,
      ogImageAlt: computed(() => `${title.value} preview`),
      twitterCard: 'summary_large_image',
      twitterTitle: title,
      twitterDescription: description,
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
