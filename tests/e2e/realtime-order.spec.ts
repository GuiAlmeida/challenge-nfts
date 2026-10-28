import { expect, test } from '@playwright/test'
import { fillLogin, openWithMocks, placeOrder } from './helpers'
import { mock } from './mock'

test.describe('tempo real: pedidos (README 10)', () => {
  test('order.updated pelo socket confirma antes do servidor e versão antiga é ignorada', async ({ page }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    const orderId = await placeOrder(page)
    await expect(page.getByText('Pedido pendente').filter({ visible: true })).toBeVisible()
    await mock.emit(page, 'order.updated', orderId, { status: 'confirmed', txHash: '0xfeed' }, { version: 9, userId: 'u_ana' })
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 2_000 })
    await mock.emit(page, 'order.updated', orderId, { status: 'declined' }, { version: 3, userId: 'u_ana' })
    await page.waitForTimeout(500)
    await expect(page.getByTestId('receipt')).toBeVisible()
    await expect(page.getByText('Pagamento recusado').filter({ visible: true })).toHaveCount(0)
  })

  test('queda do socket mostra reconexão e o pedido é reconciliado pela API', async ({ page }) => {
    await openWithMocks(page, '/login?mock-scenario=cart-seeded')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
    await placeOrder(page)
    await mock.dropSocket(page)
    await expect(page.getByTestId('receipt')).toBeVisible({ timeout: 10_000 })
    expect(await mock.socketSessions(page)).toBe(1)
  })
})
