import { expect, type Page, test } from '@playwright/test'
import { fillLogin, openWithMocks, signIn } from './helpers'

const favoriteEmerald = (page: Page) => page.getByRole('button', { name: 'Favoritar Emerald Ape #042' }).first()
const favoriteSage = (page: Page) => page.getByRole('button', { name: 'Favoritar Sage Nomad #009' }).first()
const unfavoriteSage = (page: Page) => page.getByRole('button', { name: 'Remover Sage Nomad #009 dos favoritos' }).first()

test.describe('favoritos (README 4)', () => {
  test('visitante é levado ao login e volta para onde estava', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await favoriteEmerald(page).click()
    await expect(page).toHaveURL(/\/login\?redirect=/)
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await expect(page).toHaveURL('/')
    await expect(favoriteEmerald(page)).toBeVisible()
  })

  test('favoritar é otimista, persiste após reload e é por usuário', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await signIn(page)
    await favoriteSage(page).click()
    await expect(unfavoriteSage(page)).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByText('Sage Nomad #009 adicionado aos favoritos.')).toBeVisible()

    await page.reload()
    await expect(unfavoriteSage(page)).toHaveAttribute('aria-pressed', 'true')

    await unfavoriteSage(page).click()
    await expect(favoriteSage(page)).toHaveAttribute('aria-pressed', 'false')
    await favoriteSage(page).click()
    await expect(unfavoriteSage(page)).toBeVisible()

    await page.evaluate(() => localStorage.removeItem('kurio.session'))
    await signIn(page, 'bruno@kurio.test', 'Kurio!2026')
    await expect(favoriteSage(page)).toHaveAttribute('aria-pressed', 'false')
  })

  test('erro do servidor desfaz o favorito e avisa', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await signIn(page)
    await page.evaluate("window.__kurioMock.setScenario('http-errors', { reset: false })")
    await favoriteSage(page).click()
    await expect(page.getByText(/Não foi possível atualizar Sage Nomad #009/)).toBeVisible()
    await expect(favoriteSage(page)).toHaveAttribute('aria-pressed', 'false')
  })
})
