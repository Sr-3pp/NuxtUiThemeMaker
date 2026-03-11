import type { StoredPalette } from '~/types/palette-store'

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
