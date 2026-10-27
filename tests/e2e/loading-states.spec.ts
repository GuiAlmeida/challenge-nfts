import { expect, test } from '@playwright/test'
import { cards, openWithMocks, searchFor } from './helpers'

test.describe('estados de carregamento do catálogo (README 12)', () => {
  test('cenário slow mostra skeleton antes do grid', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=slow')
    await expect(page.getByRole('status', { name: 'Carregando NFTs' })).toBeVisible()
    await expect(cards(page)).toHaveCount(9, { timeout: 15_000 })
  })

  test('cenário http-errors mostra erro com nova tentativa que recupera', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=http-errors')
    const alert = page.getByRole('alert').filter({ hasText: 'Não foi possível carregar' })
    await expect(alert).toBeVisible({ timeout: 15_000 })
    await expect(alert).toContainText('Falha transitória no catálogo.')
    await alert.getByRole('button', { name: 'Tentar novamente' }).click()
    await expect(cards(page)).toHaveCount(9, { timeout: 15_000 })
  })

  test('respostas fora de ordem: a UI mostra a última busca', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-scenario=out-of-order')
    await searchFor(page, isMobile, 'golden')
    await expect(page).toHaveURL(/q=golden/)
    await expect(cards(page).first()).toContainText('Golden')
    await page.waitForTimeout(2_000)
    await expect(cards(page)).toHaveCount(3)
    await expect(cards(page).first()).toContainText('Golden')
  })
})
