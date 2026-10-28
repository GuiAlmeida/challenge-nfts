import { expect, type Page, test } from '@playwright/test'
import { addToCart, connectWallet, fillLogin, openWithMocks, placeOrder } from './helpers'
import { mock } from './mock'

async function guestCartThenLogin(page: Page, isMobile: boolean, scenario: string) {
  await openWithMocks(page, `/?mock-scenario=${scenario}`)
  await addToCart(page, isMobile, 'emerald-ape-042')
  await page.goto('/login')
  await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

test.describe('falhas no checkout (README 7)', () => {
  test('pagamento recusado preserva o carrinho', async ({ page, isMobile }) => {
    await guestCartThenLogin(page, isMobile, 'payment-declined')
    await placeOrder(page)
    await expect(page.getByText('Pagamento recusado').filter({ visible: true })).toBeVisible({ timeout: 10_000 })
    await page.getByRole('link', { name: 'Voltar ao carrinho' }).click()
    await expect(page.getByTestId('cart-row').filter({ visible: true }).filter({ hasText: 'Emerald Ape #042' })).toBeVisible()
  })

  test('timeout no envio: tentar novamente reaproveita a chave e não duplica o pedido', async ({ page, isMobile }) => {
    test.slow()
    await guestCartThenLogin(page, isMobile, 'order-timeout')
    await page.goto('/checkout')
    await connectWallet(page)
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    const alert = page.getByRole('alert').filter({ hasText: 'A requisição demorou demais.' })
    await expect(alert).toBeVisible({ timeout: 20_000 })
    await alert.getByRole('button', { name: 'Tentar novamente' }).click()
    await page.waitForURL(/\/orders\/ord_/, { timeout: 20_000 })
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 15_000 })
    expect(await mock.orderCount(page)).toBe(1)
  })

  test('carteira recusada bloqueia a confirmação até reconectar', async ({ page, isMobile }) => {
    await guestCartThenLogin(page, isMobile, 'default')
    await page.goto('/checkout')
    await page.getByRole('checkbox', { name: /Simular recusa/ }).click()
    await page.getByRole('radio', { name: 'MetaMask', exact: true }).click()
    await expect(page.getByText('A carteira recusou a conexão.').filter({ visible: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toHaveAttribute('aria-disabled', 'true')
    await page.getByRole('button', { name: 'Tentar de novo' }).click()
    await expect(page.getByText('MetaMask conectada.').filter({ visible: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).not.toHaveAttribute('aria-disabled', 'true')
  })

  test('cotação desatualizada exige nova confirmação (README 9 no checkout)', async ({ page, isMobile }) => {
    test.slow()
    await guestCartThenLogin(page, isMobile, 'price-change')
    await page.goto('/checkout')
    await expect(page.getByText('1.206 ETH').filter({ visible: true })).toBeVisible()
    await connectWallet(page)
    await expect(page.getByText('Preço de Emerald Ape #042 mudou de 1.19 para 1.309 ETH.').filter({ visible: true })).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page.getByText('A cotação mudou').filter({ visible: true })).toBeVisible()
    await expect(page.getByText('Novo total: 1.325 ETH').filter({ visible: true })).toBeVisible()
    await page.getByRole('button', { name: 'Confirmar com os novos valores' }).click()
    await page.waitForURL(/\/orders\/ord_/)
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('receipt')).toContainText('1.325 ETH')
  })

  test('edição esgotada pelo socket durante o checkout bloqueia a confirmação (README 9)', async ({ page, isMobile }) => {
    test.slow()
    await guestCartThenLogin(page, isMobile, 'sold-out')
    await page.goto('/checkout')
    await connectWallet(page)
    await expect(page.getByText('Emerald Ape #042 esgotou.').filter({ visible: true })).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    const alert = page.getByRole('alert').filter({ hasText: '"Emerald Ape #042" esgotou.' })
    await expect(alert).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toHaveAttribute('aria-disabled', 'true')
    expect(await mock.orderCount(page)).toBe(0)

    await alert.getByRole('link', { name: 'Revisar carrinho' }).click()
    await expect(page).toHaveURL('/cart')
    await expect(page.getByText('Esgotado').filter({ visible: true }).first()).toBeVisible()
  })
})
