import { expect, test } from '@playwright/test'

test('socket.io-client conecta via MSW, recebe evento do mock e reconecta após queda', async ({ page }) => {
  await page.goto('/dev/spike')
  await expect(page.getByTestId('socket-status')).toHaveText('connected', { timeout: 15_000 })
  await expect(page.getByTestId('mock-token')).toHaveText('spike-token')

  await page.getByRole('button', { name: 'Emitir evento' }).click()
  await expect(page.getByTestId('events').locator('li')).toHaveCount(1)
  await expect(page.getByTestId('events')).toContainText('nft.updated · spike-nft · v1')

  await page.getByRole('button', { name: 'Derrubar conexão' }).click()
  await expect(page.getByTestId('socket-status')).toHaveText('disconnected')
  await expect(page.getByTestId('socket-status')).toHaveText('connected', { timeout: 15_000 })
  await expect(page.getByTestId('reconnects')).toHaveText('1')

  await page.getByRole('button', { name: 'Emitir evento' }).click()
  await expect(page.getByTestId('events').locator('li')).toHaveCount(2)
  await expect(page.getByTestId('events')).toContainText('v2')
})

test('conexão sobrevive além do ping timeout do engine.io (heartbeat do mock)', async ({ page }) => {
  test.slow()
  await page.goto('/dev/spike')
  await expect(page.getByTestId('socket-status')).toHaveText('connected', { timeout: 15_000 })
  await page.waitForTimeout(35_000)
  await expect(page.getByTestId('socket-status')).toHaveText('connected')
  await expect(page.getByTestId('reconnects')).toHaveText('0')
})
