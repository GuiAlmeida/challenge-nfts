import { expect, test } from '@playwright/test'
import { cards, openWithMocks, priceOf, searchFor, toggleCollection } from './helpers'

test.describe('catálogo (README 1)', () => {
  test('lista, pagina e mantém a URL como fonte de verdade', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await expect(cards(page)).toHaveCount(9)
    await expect(cards(page).first()).toContainText('Emerald Ape #042')

    await page.getByRole('link', { name: 'Página 2' }).click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')
    await expect(cards(page).first()).not.toContainText('Emerald Ape #042')

    await page.reload()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')

    await page.goBack()
    await expect(page).not.toHaveURL(/page=/)
    await expect(cards(page).first()).toContainText('Emerald Ape #042')
  })

  test('filtro de coleção zera a página e sobrevive ao refresh', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1&page=2')
    await expect(page.getByRole('link', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page')

    await toggleCollection(page, isMobile, 'Música')
    await expect(page).toHaveURL(/collection=musica/)
    await expect(page).not.toHaveURL(/page=/)
    await expect(cards(page)).toHaveCount(5)
    await expect(page.getByRole('button', { name: 'Limpar filtros' }).first()).toBeVisible({
      visible: !isMobile,
    })

    await page.reload()
    await expect(page).toHaveURL(/collection=musica/)
    await expect(cards(page)).toHaveCount(5)

    await toggleCollection(page, isMobile, 'Utilidade')
    await expect(page).toHaveURL(/collection=musica(,|%2C)utilidade/)
    await expect(cards(page)).toHaveCount(9)
  })

  test('ordenação e tabs vivem na URL', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await page.getByRole('combobox', { name: 'Ordenar por' }).click()
    await page.getByRole('option', { name: 'Menor preço' }).click()
    await expect(page).toHaveURL(/sort=price_asc/)
    await expect(cards(page).first()).not.toContainText('Emerald Ape #042')
    const first = await priceOf(cards(page).nth(0))
    const second = await priceOf(cards(page).nth(1))
    expect(first).toBeLessThanOrEqual(second)

    await page.getByRole('link', { name: 'Em alta' }).click()
    await expect(page).toHaveURL(/tab=trending/)
    await expect(page).toHaveURL(/sort=price_asc/)
    await expect(page.getByRole('link', { name: 'Em alta' })).toHaveAttribute('aria-current', 'page')
  })

  test('busca sem resultado mostra estado vazio e limpa filtros', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await searchFor(page, isMobile, 'zzzz-nao-existe')
    await expect(page).toHaveURL(/q=zzzz-nao-existe/)
    await expect(page.getByRole('status').filter({ hasText: 'Nenhum NFT encontrado' })).toBeVisible()
    await page.getByRole('button', { name: 'Limpar filtros' }).last().click()
    await expect(page).not.toHaveURL(/q=/)
    await expect(cards(page)).toHaveCount(9)
  })
})

test.describe('carrossel do hero', () => {
  test('troca sozinho, para quando o usuário escolhe um destaque e não roda com movimento reduzido', async ({ page }) => {
    await page.clock.install()
    await openWithMocks(page, '/?mock-reset=1')
    const hero = page.getByRole('region', { name: 'Destaques' }).filter({ visible: true })
    await expect(hero.getByText('Bem-vindo à Kurio')).toBeVisible()
    await page.mouse.move(0, 0)
    await page.clock.runFor(9_100)
    await expect(hero.getByText('Novos lançamentos')).toBeVisible()

    await hero.getByRole('button', { name: 'Destaque 3 de 3: Em alta' }).click()
    await page.mouse.move(0, 0)
    await page.clock.runFor(20_000)
    await expect(hero.getByText('Em alta')).toBeVisible()

    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.reload()
    await page.mouse.move(0, 0)
    await page.clock.runFor(20_000)
    await expect(page.getByRole('region', { name: 'Destaques' }).filter({ visible: true }).getByText('Bem-vindo à Kurio')).toBeVisible()
  })
})
