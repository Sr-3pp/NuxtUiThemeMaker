import { expect, test } from '@nuxt/test-utils/playwright'

test('home page renders the builder shell', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })

  await expect(page.getByText('Nuxt UI Theme Builder')).toBeVisible()
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('login page renders the sign-in form', async ({ page, goto }) => {
  await goto('/login', { waitUntil: 'hydration' })

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})
