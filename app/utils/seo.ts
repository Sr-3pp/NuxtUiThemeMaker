import type { StoredPalette } from '~/types/palette-store'
import type { SeoRouteDefinition } from '~/types/seo'

export const indexableSeoRoutes: SeoRouteDefinition[] = [
  {
    path: '/',
    title: 'Generate Nuxt UI Themes From a Prompt',
    description: 'Generate a Nuxt UI palette, watch the landing page restyle itself, then continue in the full editor, export flow, and workspace.',
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    path: '/editor',
    title: 'Build and Share Nuxt UI Themes',
    description: 'Create Nuxt UI color palettes with live previews, token editing, export tools, and shareable public links.',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Choose the plan with the generation and save limits that fit your palette workflow.',
    changefreq: 'monthly',
    priority: '0.6',
  },
]

export function buildSiteJsonLd(siteName: string, siteUrl: string, siteDescription: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: siteUrl,
    description: siteDescription,
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
