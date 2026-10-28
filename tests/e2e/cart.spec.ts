import { expect, type Page, test } from '@playwright/test'
import { addToCart, fillLogin, openWithMocks } from './helpers'

const row = (page: Page, name: string) => page.getByTestId('cart-row').filter({ visible: true }).filter({ hasText: name })

test.describe('carrinho (README 5)', () => {
  test('visitante adiciona, altera quantidade, aplica cupom, remove e mantém após refresh', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await addToCart(page, isMobile, 'emerald-ape-042')
    await page.goto('/cart')
    await expect(row(page, 'Emerald Ape #042')).toBeVisible()

    await page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape #042' }).click()
    await expect(row(page, 'Emerald Ape #042')).toContainText('2.38 ETH')
    await expect(page.getByText('26.83 ETH').filter({ visible: true })).toHaveCount(0)
    await expect(page.getByText('2.396 ETH').filter({ visible: true })).toBeVisible()

    await page.reload()
    await expect(row(page, 'Emerald Ape #042')).toContainText('2.38 ETH')

    await page.getByRole('textbox', { name: 'Código promocional' }).fill('KURIO10')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByText('(-) 0.238 ETH').filter({ visible: true })).toBeVisible()
    await expect(page.getByText('2.158 ETH').filter({ visible: true })).toBeVisible()
    await page.getByRole('button', { name: 'Remover', exact: true }).click()
    await expect(page.getByText('2.396 ETH').filter({ visible: true })).toBeVisible()

    await page.getByRole('textbox', { name: 'Código promocional' }).fill('NADA')
    await page.getByRole('button', { name: 'Aplicar' }).click()
    await expect(page.getByRole('alert').filter({ hasText: 'Cupom inválido.' })).toBeVisible()
    await expect(page.getByText('2.396 ETH').filter({ visible: true })).toBeVisible()

    await page.getByRole('button', { name: 'Remover Emerald Ape #042 do carrinho' }).click()
    await expect(page.getByText('Seu carrinho está vazio').filter({ visible: true })).toBeVisible()
  })

  test('itens do visitante são mantidos ao entrar', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await addToCart(page, isMobile, 'golden-beat-207')
    await page.goto('/login')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await expect(page.getByText('Os itens do seu carrinho foram mantidos.').filter({ visible: true })).toBeVisible()
    await page.goto('/cart')
    await expect(row(page, 'Golden Beat #207')).toBeVisible()
    if (!isMobile) await expect(page.getByRole('button', { name: 'Carrinho, 1 itens' })).toBeVisible()
  })

  test('card adiciona direto e o mini carrinho abre no hover', async ({ page, isMobile }) => {
    test.skip(isMobile, 'atalho do card e mini carrinho são do desktop')
    await openWithMocks(page, '/?mock-reset=1')
    const card = page.getByRole('article', { name: 'Golden Beat #207' })
    await card.hover()
    await card.getByRole('button', { name: 'Adicionar Golden Beat #207 ao carrinho' }).click()
    const cart = page.getByRole('button', { name: 'Carrinho, 1 itens' })
    await expect(cart).toBeVisible()
    await cart.hover()
    const miniCart = page.getByRole('dialog', { name: 'Resumo do carrinho' })
    await expect(miniCart.getByText('Golden Beat #207')).toBeVisible()
    await page.mouse.move(10, 600)
    await expect(miniCart).toBeHidden()
  })
})
