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
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxtjs/i18n'
  ],
  css: [
    '@/assets/css/main.css' 
  ]
})
