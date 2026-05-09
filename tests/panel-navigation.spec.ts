import { expect, test } from '@nuxt/test-utils/playwright'

test.describe.configure({ mode: 'serial' })

test('anonymous users are redirected away from panel pages', async ({ page, goto }) => {
  await goto('/panel/palettes', { waitUntil: 'hydration' })

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})

test('homepage can navigate to the editor', async ({ page, goto }) => {
  await goto('/', { waitUntil: 'hydration' })

  await page.getByRole('link', { name: 'Open editor' }).first().click()

  await expect(page).toHaveURL(/\/editor/)
  await expect(page.getByText('Nuxt UI Theme Builder').first()).toBeVisible()
})
