import { createError, getRequestHeader, type H3Event } from 'h3'

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function parseList(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value.map(entry => entry.trim()).filter(Boolean)
  }

  return String(value ?? '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
}

function getTrustedOrigins() {
  const config = useRuntimeConfig()
  const trustedOrigins = new Set<string>()

  for (const candidate of [
    config.public.siteUrl,
    config.betterAuthUrl,
    ...parseList(config.betterAuthTrustedOrigins),
  ]) {
    if (typeof candidate !== 'string' || !candidate.trim()) {
      continue
    }

    const normalized = normalizeOrigin(candidate.trim())

    if (normalized) {
      trustedOrigins.add(normalized)
    }
  }

  return trustedOrigins
}

export function assertTrustedBrowserOrigin(event: H3Event) {
  const originHeader = getRequestHeader(event, 'origin')
  const refererHeader = getRequestHeader(event, 'referer')
  const candidateOrigin = originHeader ?? refererHeader

  if (!candidateOrigin) {
    return
  }

  const normalizedOrigin = normalizeOrigin(candidateOrigin)

  if (!normalizedOrigin || !getTrustedOrigins().has(normalizedOrigin)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Untrusted request origin',
    })
  }
}
