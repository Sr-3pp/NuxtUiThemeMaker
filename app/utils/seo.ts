import type { StoredPalette } from '~/types/palette-store'
import type { SeoRouteDefinition } from '~/types/seo'

export const indexableSeoRoutes: SeoRouteDefinition[] = [
  {
    path: '/',
    title: 'Theme Builder for Nuxt UI - Home',
    description: 'Create beautiful, customizable Nuxt UI themes with AI palettes, live component previews, variant editing, QA, export, and sharing.',
    changefreq: 'weekly',
    keywords: [
      'theme builder for nuxt ui',
      'nuxt themes',
      'nuxt ui themes',
      'nuxt theme generator',
      'nuxt ui theme builder',
      'nuxt ui custom colors',
      'nuxt ui variants',
      'nuxt color palette',
      'nuxt ui color palette',
      'nuxt design tokens',
      'nuxt ui templates',
    ],
    priority: '1.0',
  },
  {
    path: '/nuxt-themes',
    title: 'Nuxt Themes for Nuxt UI Apps',
    description: 'Create, preview, validate, export, and share Nuxt themes for Nuxt UI projects without hand-tuning every color token.',
    changefreq: 'weekly',
    keywords: [
      'nuxt themes',
      'nuxt theme builder',
      'nuxt theme generator',
      'nuxt ui themes',
      'nuxt ui theme editor',
      'nuxt ui theme generator',
      'nuxt ui color themes',
      'nuxt app themes',
    ],
    priority: '0.95',
  },
  {
    path: '/editor',
    title: 'Nuxt UI Theme Editor and Palette Builder',
    description: 'Build Nuxt UI themes with live previews, token editing, accessible color checks, export tools, and shareable public palette links.',
    changefreq: 'weekly',
    keywords: [
      'nuxt ui theme editor',
      'nuxt ui palette builder',
      'nuxt ui theme export',
      'nuxt color tokens',
      'nuxt ui app config',
    ],
    priority: '0.9',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Choose the plan with the generation and save limits that fit your palette workflow.',
    changefreq: 'monthly',
    keywords: [
      'nuxt theme builder pricing',
      'nuxt ui theme generator pricing',
    ],
    priority: '0.6',
  },
]

export const nuxtThemeKeywordClusters = [
  {
    title: 'Nuxt theme generator',
    description: 'Generate a usable Nuxt UI theme from a product prompt, then refine the palette in the editor.',
  },
  {
    title: 'Nuxt UI theme builder',
    description: 'Tune semantic colors, neutral scales, component states, and app config output in one workflow.',
  },
  {
    title: 'Nuxt color palette editor',
    description: 'Build light and dark palettes, preview them on realistic UI sections, and export the result.',
  },
  {
    title: 'Nuxt design tokens',
    description: 'Review theme tokens, CSS variables, and component overrides before shipping a Nuxt UI theme.',
  },
  {
    title: 'Nuxt UI templates and themes',
    description: 'Start from generated or shared palettes when you need a polished visual direction for a Nuxt app.',
  },
  {
    title: 'Accessible Nuxt themes',
    description: 'Use QA checks to catch low contrast, weak focus rings, and risky semantic colors before export.',
  },
]

export function getSeoRoute(path: string): SeoRouteDefinition {
  const route = indexableSeoRoutes.find(route => route.path === path)

  if (route) {
    return route
  }

  return {
    path,
    title: 'Nuxt UI Theme Builder',
    description: 'Build, preview, save, and share Nuxt UI color palettes with a live component workbench.',
    changefreq: 'monthly',
    priority: '0.5',
  }
}

function normalizeSiteUrl(siteUrl: string) {
  return new URL('/', siteUrl).toString()
}

function omitJsonLdContext(entry: Record<string, unknown>) {
  const jsonLd = { ...entry }

  delete jsonLd['@context']

  return jsonLd
}

export function buildSiteJsonLd(siteName: string, siteUrl: string, siteDescription: string) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': new URL('/#website', normalizedSiteUrl).toString(),
    inLanguage: 'en',
    name: siteName,
    url: normalizedSiteUrl,
    description: siteDescription,
  }
}

export function buildWebPageJsonLd(siteName: string, siteUrl: string, path: string, name: string, description: string) {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl)
  const pageUrl = new URL(path, normalizedSiteUrl).toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    inLanguage: 'en',
    name,
    description,
    url: pageUrl,
    isPartOf: {
      '@id': new URL('/#website', normalizedSiteUrl).toString(),
      '@type': 'WebSite',
      name: siteName,
      url: normalizedSiteUrl,
    },
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: [pageUrl],
      },
    ],
  }
}

export function buildHomeSeoGraphJsonLd(siteName: string, siteUrl: string, siteDescription: string, pageTitle: string) {
  const site = buildSiteJsonLd(siteName, siteUrl, siteDescription)
  const page = buildWebPageJsonLd(siteName, siteUrl, '/', pageTitle, siteDescription)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      omitJsonLdContext(site),
      omitJsonLdContext(page),
    ],
  }
}

export function buildSoftwareApplicationJsonLd(siteName: string, siteUrl: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    applicationCategory: 'DesignApplication',
    name: siteName,
    operatingSystem: 'Web',
    url: siteUrl,
    description,
  }
}

export function buildNuxtThemesFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are Nuxt themes?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nuxt themes are reusable visual settings for a Nuxt app, including colors, design tokens, component styles, and light or dark mode choices.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I export themes for Nuxt UI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The editor can export Nuxt UI theme data as JSON, CSS variables, TypeScript, app config, and component override files.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which Nuxt theme keywords does this tool support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The tool is designed for Nuxt themes, Nuxt UI themes, Nuxt UI theme generation, color palettes, design tokens, accessible palettes, and export-ready app config workflows.',
        },
      },
    ],
  }
}

export function buildPaletteDescription(palette: Pick<StoredPalette, 'name' | 'slug' | 'isPublic'>) {
  const visibility = palette.isPublic ? 'Public' : 'Private'
  return `${visibility} Nuxt UI palette "${palette.name}" with live component previews and export-ready theme tokens.`
}

export function buildPaletteJsonLd(siteUrl: string, palette: Pick<StoredPalette, 'name' | 'slug' | 'createdAt' | 'updatedAt'>) {
  const paletteUrl = new URL(`/palette/${palette.slug}`, siteUrl).toString()

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: palette.name,
    url: paletteUrl,
    dateCreated: palette.createdAt,
    dateModified: palette.updatedAt,
    description: `Nuxt UI color palette "${palette.name}" shared from the theme builder.`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Nuxt UI Theme Builder',
      url: siteUrl,
    },
  }
}

export function buildPaletteBreadcrumbJsonLd(siteUrl: string, palette: Pick<StoredPalette, 'name' | 'slug'>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: new URL('/', siteUrl).toString(),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: palette.name,
        item: new URL(`/palette/${palette.slug}`, siteUrl).toString(),
      },
    ],
  }
}
