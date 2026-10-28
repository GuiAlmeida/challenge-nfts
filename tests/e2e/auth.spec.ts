import { expect, test } from '@playwright/test'
import { fillLogin, openWithMocks, signIn } from './helpers'

test.describe('autenticação e sessão (README 3)', () => {
  test('rota privada leva ao login, volta após entrar e sobrevive ao refresh', async ({ page, isMobile }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout/)
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await expect(page).toHaveURL('/checkout')
    if (!isMobile) await expect(page.getByRole('button', { name: 'Conta de Ana Lima' })).toBeVisible()

    await page.reload()
    await expect(page).toHaveURL('/checkout')
    if (!isMobile) await expect(page.getByRole('button', { name: 'Conta de Ana Lima' })).toBeVisible()

    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })

  test('credenciais inválidas e validação local aparecem no formulário', async ({ page }) => {
    await openWithMocks(page, '/login?mock-reset=1')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await expect(page.getByText('Informe um e-mail válido')).toBeVisible()
    await fillLogin(page, 'ana@kurio.test', 'errada123')
    await expect(page.getByRole('alert')).toContainText('E-mail ou senha incorretos.')
    await expect(page).toHaveURL(/\/login/)
  })

  test('cadastro cria a conta e entra; e-mail já usado volta como erro de campo', async ({ page, isMobile }) => {
    await openWithMocks(page, '/register?mock-reset=1')
    const submit = page.getByRole('button', { name: isMobile ? 'Criar perfil' : 'Criar conta', exact: true })
    await page.getByRole('textbox', { name: 'Nome de usuário' }).fill('nova_colecionadora')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('ana@kurio.test')
    await page.getByLabel('Senha', { exact: true }).fill('Senha1234')
    await page.getByLabel('Confirmar senha', { exact: true }).fill('Senha1234')
    await submit.click()
    await expect(page.getByText('Este e-mail já está cadastrado.')).toBeVisible()

    await page.getByRole('textbox', { name: 'E-mail' }).fill('nova@kurio.test')
    await submit.click()
    await expect(page).toHaveURL('/')
    if (!isMobile) await expect(page.getByRole('button', { name: 'Conta de nova_colecionadora' })).toBeVisible()
  })

  test('sair limpa a sessão e volta a pedir login nas rotas privadas', async ({ page, isMobile }) => {
    test.skip(isMobile, 'menu de conta só no header desktop')
    await openWithMocks(page, '/?mock-reset=1')
    await signIn(page)
    await page.getByRole('button', { name: 'Conta de Ana Lima' }).click()
    await page.getByRole('menuitem', { name: 'Sair' }).click()
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
    await page.goto('/account/profile')
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })

  test('sessão expirada avisa e derruba (cenário session-expired)', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=session-expired')
    await signIn(page)
    await page.goto('/nft/emerald-ape-042')
    await page.clock.install()
    await page.clock.fastForward(16_000)
    await page.getByRole('button', { name: 'Favoritar Emerald Ape #042' }).first().click()
    await expect(page.getByText('Sua sessão expirou. Entre novamente para continuar.')).toBeVisible()
    await page.goto('/checkout')
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })

  test('sessão expirada no checkout volta com o rascunho preservado', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=session-expired')
    await page.evaluate(() => window.__kurioMock?.setScenario('cart-seeded', { reset: true }))
    await page.evaluate(() => window.__kurioMock?.setScenario('session-expired', { reset: false }))
    await signIn(page)
    await page.goto('/checkout')
    const note = page.getByRole('textbox', { name: 'Observação do colecionador (opcional)' })
    await note.fill('Rascunho antes de expirar')
    await page.waitForTimeout(700)
    await page.clock.install()
    await page.clock.fastForward(16_000)
    await page.getByRole('radio', { name: 'MetaMask', exact: true }).click()
    await page.clock.runFor(1_000)
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout/)
    await expect(page.getByText('Sua sessão expirou. Entre novamente para continuar.').filter({ visible: true })).toBeVisible()
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await expect(page).toHaveURL('/checkout')
    await expect(page.getByRole('textbox', { name: 'Observação do colecionador (opcional)' })).toHaveValue('Rascunho antes de expirar')
  })
})
