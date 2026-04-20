import type { Page } from '@playwright/test'

/**
 * Logs in as a given user by navigating to /login and submitting credentials.
 * Waits until the browser has redirected away from /login (to dashboard or main page).
 */
export async function loginAs(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/login')

  // Fill in credentials
  await page.getByLabel(/e-?mail/i).fill(email)
  await page.getByLabel(/senha/i).fill(password)

  // Submit
  await page.getByRole('button', { name: /entrar|login|acessar/i }).click()

  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  })
}
