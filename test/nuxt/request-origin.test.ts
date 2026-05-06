import { createEvent } from 'h3'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { assertTrustedBrowserOrigin } from '~~/server/utils/request-origin'

type MutableRuntimeConfig = {
  public: {
    siteUrl: string
  }
  betterAuthUrl: string
  betterAuthTrustedOrigins: string[] | string
}

function getMutableRuntimeConfig() {
  return useRuntimeConfig() as unknown as MutableRuntimeConfig
}

function createRequest(origin: string) {
  const responseHeaders = new Map<string, string>()

  return createEvent({
    method: 'POST',
    url: '/api/palettes/generate',
    headers: { origin },
  } as never, {
    writableEnded: false,
    headersSent: false,
    setHeader(name: string, value: string) {
      responseHeaders.set(name.toLowerCase(), value)
    },
    getHeader(name: string) {
      return responseHeaders.get(name.toLowerCase())
    },
  } as never)
}

describe('request origin guard', () => {
  let originalRuntimeConfig: {
    public: {
      siteUrl: string
    }
    betterAuthUrl: string
    betterAuthTrustedOrigins: string[] | string
  }

  beforeEach(() => {
    const config = getMutableRuntimeConfig()

    originalRuntimeConfig = {
      public: {
        siteUrl: config.public.siteUrl,
      },
      betterAuthUrl: config.betterAuthUrl,
      betterAuthTrustedOrigins: config.betterAuthTrustedOrigins,
    }
  })

  afterEach(() => {
    const config = getMutableRuntimeConfig()

    config.public.siteUrl = originalRuntimeConfig.public.siteUrl
    config.betterAuthUrl = originalRuntimeConfig.betterAuthUrl
    config.betterAuthTrustedOrigins = originalRuntimeConfig.betterAuthTrustedOrigins
  })

  it('accepts trusted origins from a comma-separated runtime config string', () => {
    const config = getMutableRuntimeConfig()

    config.public.siteUrl = 'https://nuxtthemes.dev'
    config.betterAuthUrl = 'https://nuxtthemes.dev'
    config.betterAuthTrustedOrigins = 'https://nuxtthemes.dev, https://www.nuxtthemes.dev'

    expect(() => assertTrustedBrowserOrigin(createRequest('https://www.nuxtthemes.dev'))).not.toThrow()
  })

  it('rejects origins not present in runtime config', () => {
    const config = getMutableRuntimeConfig()

    config.public.siteUrl = 'https://nuxtthemes.dev'
    config.betterAuthUrl = 'https://nuxtthemes.dev'
    config.betterAuthTrustedOrigins = 'https://nuxtthemes.dev'

    expect(() => assertTrustedBrowserOrigin(createRequest('https://evil.example'))).toThrowError(
      expect.objectContaining({
        statusCode: 403,
        statusMessage: 'Untrusted request origin',
      }),
    )
  })
})
