import { expect, test } from '@playwright/test'

test('en obehörig besökare skickas till inloggningsvyn', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Mini-ATS' })).toBeVisible()
  await expect(page.getByLabel('E-post')).toBeVisible()
  await expect(page.getByLabel('Lösenord')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Logga in' })).toBeVisible()
})

test('felaktiga uppgifter visar ett felmeddelande vid fältet, inte en inloggning', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByLabel('E-post').fill('does-not-exist@example.com')
  await page.getByLabel('Lösenord').fill('wrong-password')
  await page.getByRole('button', { name: 'Logga in' }).click()

  await expect(page.getByRole('alert')).toContainText(
    /Fel e-postadress eller lösenord\.|Något gick fel\. Försök igen\./,
  )
  await expect(page).toHaveURL(/\/login$/)
})
