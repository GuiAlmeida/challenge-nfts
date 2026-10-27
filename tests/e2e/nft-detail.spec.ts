import { expect, test } from '@playwright/test'
import { openWithMocks } from './helpers'

test.describe('detalhe do NFT (README 2)', () => {
  test('abre pelo card, troca edição, limita quantidade e adiciona ao carrinho', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await page.getByRole('link', { name: 'Ver detalhes de Emerald Ape #042' }).click()
    await expect(page).toHaveURL('/nft/emerald-ape-042')
    await expect(page).toHaveTitle(/Emerald Ape #042/)
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible()
    await expect(page.getByRole('radio', { name: '1/10', exact: true })).toHaveAttribute('aria-checked', 'true')

    const plus = page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' })
    const quantity = page.getByRole('status').filter({ hasText: /^\d+$/ })

    await page.getByRole('radio', { name: '1/1', exact: true }).click()
    await expect(page.getByRole('radio', { name: '1/1', exact: true })).toHaveAttribute('aria-checked', 'true')
    await expect(plus).toBeDisabled()
    await expect(page.getByText('Só resta 1 unidade desta edição.').filter({ visible: true })).toBeVisible()

    await page.getByRole('radio', { name: 'ABERTA' }).click()
    for (let i = 0; i < 12 && (await plus.isEnabled()); i++) await plus.click()
    await expect(quantity).toHaveText('10')
    await expect(plus).toBeDisabled()

    await page.getByRole('button', { name: isMobile ? 'Comprar NFT' : 'COMPRAR', exact: true }).click()
    await expect(page.getByText('Adicionado ao carrinho')).toBeVisible()
    if (!isMobile) await expect(page.getByRole('link', { name: 'Carrinho, 10 itens' })).toBeVisible()
  })

  test('edição esgotada fica desabilitada e nunca é a padrão', async ({ page }) => {
    await openWithMocks(page, '/nft/neon-vessel-552?mock-reset=1')
    const soldOut = page.getByRole('radio', { name: '1/1, esgotada' })
    await expect(soldOut).toHaveAttribute('aria-disabled', 'true')
    await expect(page.getByRole('radio', { name: '1/10', exact: true })).toHaveAttribute('aria-checked', 'true')
    await soldOut.click({ force: true })
    await expect(page.getByRole('radio', { name: '1/10', exact: true })).toHaveAttribute('aria-checked', 'true')
  })

  test('NFT inexistente mostra 404 com caminho de volta', async ({ page }) => {
    await openWithMocks(page, '/nft/nao-existe?mock-reset=1')
    await expect(page.getByText('NFT não encontrado')).toBeVisible()
    await page.getByRole('link', { name: 'Voltar ao catálogo' }).click()
    await expect(page).toHaveURL('/')
  })
})
