import { expect, test } from '@playwright/test'
import { connectWallet, fillLogin, openWithMocks, placeOrder } from './helpers'
import { mock } from './mock'

test.describe('checkout e pedido confirmado (README 6)', () => {
  test('confirma a compra, acompanha o pedido e mostra o recibo após a confirmação', async ({ page, isMobile }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    await page.goto('/checkout')
    await expect(page.getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Lima')
    await expect(page.getByText('26.846 ETH').filter({ visible: true })).toBeVisible()

    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await expect(confirm).toHaveAttribute('aria-disabled', 'true')
    await connectWallet(page)
    await expect(confirm).not.toHaveAttribute('aria-disabled', 'true')

    await confirm.click()
    await page.waitForURL(/\/orders\/ord_/)
    await expect(page.getByText('Pedido pendente').filter({ visible: true })).toBeVisible()
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('receipt')).toContainText('Seus NFTs agora estão na sua carteira')
    await expect(page.getByTestId('receipt')).toContainText('26.846 ETH')
    expect(await mock.orderCount(page)).toBe(1)

    await page.reload()
    await expect(page.getByTestId('receipt')).toBeVisible()
    await page.getByRole('button', { name: 'Ver no Etherscan' }).click()
    const explorer = page.getByRole('dialog', { name: 'Explorador simulado' })
    await expect(explorer).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(explorer).toBeHidden()

    if (!isMobile) {
      await page.keyboard.press('Escape')
      await expect(page).toHaveURL('/')
      await expect(page.getByRole('button', { name: 'Carrinho', exact: true })).toBeVisible()
    }
  })

  test('clique duplo em confirmar gera um único pedido', async ({ page }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    await page.goto('/checkout')
    await connectWallet(page)
    const confirm = page.getByRole('button', { name: 'Confirmar compra' })
    await confirm.dblclick()
    await page.waitForURL(/\/orders\/ord_/)
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
    expect(await mock.orderCount(page)).toBe(1)
  })

  test('rascunho do checkout sobrevive à troca de página', async ({ page }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    await page.goto('/checkout')
    await page.getByRole('textbox', { name: 'Observação do colecionador (opcional)' }).fill('Entregar com carinho')
    await page.waitForTimeout(700)
    await page.goto('/cart')
    await page.goto('/checkout')
    await expect(page.getByRole('textbox', { name: 'Observação do colecionador (opcional)' })).toHaveValue('Entregar com carinho')
    void placeOrder
  })
})
