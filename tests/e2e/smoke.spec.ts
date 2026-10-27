import { expect, test } from '@playwright/test'

test('home carrega com título e conteúdo', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Kurio/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('rota inexistente mostra 404 com link para o início', async ({ page }) => {
  await page.goto('/nao-existe')
  await expect(page.getByRole('heading', { name: /não encontrada/i })).toBeVisible()
  await page.getByRole('link', { name: /voltar ao início/i }).click()
  await expect(page).toHaveURL('/')
})
