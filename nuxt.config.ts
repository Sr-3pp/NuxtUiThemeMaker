// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    betterAuthAllowedHosts: (process.env.NUXT_BETTER_AUTH_ALLOWED_HOSTS?.split(',') || ['localhost:3000']) as string[],
    betterAuthSecret: process.env.NUXT_BETTER_AUTH_SECRET || '',
    betterAuthTrustedOrigins: (process.env.NUXT_BETTER_AUTH_TRUSTED_ORIGINS?.split(',') || ['http://localhost:3000']) as string[],
    betterAuthUrl: process.env.NUXT_BETTER_AUTH_URL || 'http://localhost:3000',
    mongodbDbName: process.env.NUXT_MONGODB_DB_NAME || '',
    mongodbUri: process.env.NUXT_MONGODB_URI || '',
    geminiApiKey: process.env.NUXT_GEMINI_API_KEY || '',
    resendApiKey: process.env.NUXT_RESEND_API_KEY || '',
    resendFrom: process.env.NUXT_RESEND_FROM || '"Nuxt UI Theme Builder" <onboarding@resend.dev>',
    stripePublicKey: process.env.NUXT_STRIPE_PUBLIC_KEY || '',
    stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET || '',
    
    public: {
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Build, preview, save, and share Nuxt UI color palettes with a live component workbench.',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Nuxt UI Theme Builder',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || process.env.NUXT_BETTER_AUTH_URL || 'http://localhost:3000',
    },
  },
  app: {
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0a0a0a' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
  ],
  i18n: {
    defaultLocale: 'en-US',
    locales: [
      {
        code: 'en-US',
        language: 'en-US',
      },
    ],
  },
  fonts: {
    families: [
      {
        name: 'IBM Plex Sans',
        provider: 'google',
        global: true,
        weights: [400, 500, 600, 700],
        styles: ['normal'],
        subsets: ['latin'],
      },
    ],
  },
  css: [
    '@/assets/css/main.css' 
  ]
})
