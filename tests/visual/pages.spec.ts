import { expect, type Page, test } from '@playwright/test'
import { fillLogin, openWithMocks } from '../e2e/helpers'

const FIXED_NOW = new Date('2026-10-28T12:00:00-03:00')

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const img of document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]')) img.loading = 'eager'
  })
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0))
  await page.evaluate(() => document.fonts.ready)
  await page.mouse.move(0, 0)
}

async function signInWithSeededCart(page: Page): Promise<void> {
  await openWithMocks(page, '/login?mock-reset=1&mock-scenario=cart-seeded')
  await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW)
})

test('início', async ({ page }) => {
  await openWithMocks(page, '/?mock-reset=1')
  await expect(page.getByTestId('nft-card').first()).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('inicio.png', { fullPage: true })
})

test('detalhe', async ({ page }) => {
  await openWithMocks(page, '/nft/emerald-ape-042?mock-reset=1')
  await expect(page.locator('h1:visible')).toHaveText('Emerald Ape #042')
  await expect(page.getByTestId('nft-card').filter({ visible: true }).first()).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true })
})

test('carrinho', async ({ page }) => {
  await signInWithSeededCart(page)
  await page.goto('/cart')
  await expect(page.getByTestId('cart-row').filter({ visible: true })).toHaveCount(3)
  await expect(page.getByText('26.846 ETH').filter({ visible: true }).first()).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true })
})

test('pagamento', async ({ page }) => {
  await signInWithSeededCart(page)
  await page.goto('/checkout')
  await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
  await expect(page.getByText('26.846 ETH').filter({ visible: true }).first()).toBeVisible()
  await settle(page)
  await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true })
})
