import { expect, test } from '@playwright/test'
import { fillLogin, openWithMocks, placeOrder } from './helpers'

test.describe('tempo real: pedidos (README 10)', () => {
  test('order.updated pelo socket confirma antes do servidor e versão antiga é ignorada', async ({ page }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    const orderId = await placeOrder(page)
    await expect(page.getByText('Pedido pendente').filter({ visible: true })).toBeVisible()
    await page.evaluate(
      (id) => window.__kurioMock?.emit('order.updated', id, { status: 'confirmed', txHash: '0xfeed' }, { version: 9, userId: 'u_ana' }),
      orderId,
    )
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 2_000 })
    await page.evaluate((id) => window.__kurioMock?.emit('order.updated', id, { status: 'declined' }, { version: 3, userId: 'u_ana' }), orderId)
    await page.waitForTimeout(500)
    await expect(page.getByTestId('receipt')).toBeVisible()
    await expect(page.getByText('Pagamento recusado').filter({ visible: true })).toHaveCount(0)
  })

  test('queda do socket mostra reconexão e o pedido é reconciliado pela API', async ({ page }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    await placeOrder(page)
    await page.evaluate(() => window.__kurioMock?.socket.dropAll())
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
    expect(await page.evaluate(() => window.__kurioMock?.socket.sessions().length)).toBe(1)
  })
})
