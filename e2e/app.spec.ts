import { expect, test } from '@playwright/test'

test('startsidan visar appnamnet', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Mini-ATS' })).toBeVisible()
})
