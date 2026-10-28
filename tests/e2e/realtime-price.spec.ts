import { expect, test } from '@playwright/test'
import { addToCart, openWithMocks } from './helpers'
import { mock } from './mock'

test.describe('tempo real: preço e disponibilidade no carrinho (README 9 e 10)', () => {
  test('cenário price-change avisa, marca o resumo como desatualizado e atualiza sob demanda', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-scenario=price-change')
    await addToCart(page, isMobile, 'emerald-ape-042')
    await page.goto('/cart')
    await expect(page.getByText('1.206 ETH').filter({ visible: true })).toBeVisible()

    const banner = page.getByRole('status').filter({ visible: true }).filter({ hasText: 'Preço de Emerald Ape #042 mudou de 1.19 para 1.309 ETH.' })
    await expect(banner).toBeVisible({ timeout: 15_000 })
    await expect(page.getByTestId('cart-row').filter({ visible: true }).filter({ hasText: 'Emerald Ape #042' })).toContainText('1.309 ETH')
    await expect(page.getByText('O resumo está desatualizado.').filter({ visible: true })).toBeVisible()

    await banner.getByRole('button', { name: 'Atualizar resumo' }).click()
    await expect(page.getByText('1.325 ETH').filter({ visible: true })).toBeVisible()
    await expect(banner).toHaveCount(0)
  })

  test('evento duplicado e versão antiga não alteram o carrinho', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await addToCart(page, isMobile, 'emerald-ape-042')
    await page.goto('/cart')
    await expect(page.getByText('1.206 ETH').filter({ visible: true })).toBeVisible()

    const emit = (id: string, version: number, price: string) =>
      mock.emit(page, 'nft.updated', 'emerald-ape-042', { price, editions: [{ id: 'emerald-ape-042:1of10', price, available: 7 }] }, { id, version })

    await emit('evt-dup', 50, '2.00')
    await expect(page.getByText('Preço de Emerald Ape #042 mudou de 1.19 para 2.00 ETH.').filter({ visible: true })).toBeVisible()
    await emit('evt-dup', 50, '2.00')
    await emit('evt-old', 10, '3.00')
    await page.waitForTimeout(500)
    await expect(page.getByText(/mudou de 1.19 para 2.00 ETH/).filter({ visible: true })).toHaveCount(1)
    await expect(page.getByTestId('cart-row').filter({ visible: true }).filter({ hasText: 'Emerald Ape #042' })).toContainText('2.00 ETH')
    await expect(page.getByText('3.00 ETH').filter({ visible: true })).toHaveCount(0)
  })

  test('conexão sobrevive ao ping timeout do engine.io e segue recebendo eventos', async ({ page, isMobile }) => {
    test.slow()
    await openWithMocks(page, '/?mock-reset=1')
    await addToCart(page, isMobile, 'emerald-ape-042')
    await page.goto('/cart')
    await expect(page.getByText('1.206 ETH').filter({ visible: true })).toBeVisible()
    await page.waitForTimeout(35_000)
    expect(await mock.socketSessions(page)).toBe(1)
    await mock.emit(
      page,
      'nft.updated',
      'emerald-ape-042',
      { price: '1.50', editions: [{ id: 'emerald-ape-042:1of10', price: '1.50', available: 7 }] },
      { id: 'evt-late', version: 60 },
    )
    await expect(page.getByText('Preço de Emerald Ape #042 mudou de 1.19 para 1.50 ETH.').filter({ visible: true })).toBeVisible()
  })
})
