import { expect, type Page, test } from '@playwright/test'
import { fillLogin, openWithMocks, signIn } from './helpers'

const PNG_1X1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

async function openProfile(page: Page, email?: string): Promise<void> {
  await openWithMocks(page, '/?mock-reset=1')
  await signIn(page, email)
  await page.goto('/account/profile')
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
}

async function openWallets(page: Page, email?: string): Promise<void> {
  await openWithMocks(page, '/?mock-reset=1')
  await signIn(page, email)
  await page.goto('/account/wallets')
  await expect(page.getByRole('heading', { name: 'Carteira principal' })).toBeVisible()
}

const toast = (page: Page, text: string) => page.getByText(text).filter({ visible: true })
const profileForm = (page: Page) => page.getByRole('form', { name: 'Perfil do colecionador' })

test.describe('perfil e carteiras (README 8)', () => {
  test('edita o perfil, persiste após refresh e mostra erros de validação e da API', async ({ page }) => {
    await openProfile(page)
    const displayName = profileForm(page).getByRole('textbox', { name: 'Nome de exibição' })
    await displayName.fill('Ana Lima Costa')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(toast(page, 'Perfil atualizado.')).toBeVisible()
    await page.reload()
    await expect(profileForm(page).getByRole('textbox', { name: 'Nome de exibição' })).toHaveValue('Ana Lima Costa')

    const email = profileForm(page).getByRole('textbox', { name: 'E-mail' })
    await email.fill('ana@')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toBeFocused()
    await expect(profileForm(page).getByText('Informe um e-mail válido')).toBeVisible()
    await email.fill('ana@kurio.test')

    const username = profileForm(page).getByRole('textbox', { name: 'Nome de usuário' })
    await username.fill('bruno')
    await page.getByRole('button', { name: 'Salvar', exact: true }).click()
    await expect(page.getByText('Este nome de usuário já existe.')).toBeVisible()
    await expect(username).toHaveAttribute('aria-invalid', 'true')
    await expect(username).toBeFocused()
  })

  test('troca e remove o avatar, recusando arquivo inválido', async ({ page }) => {
    await openProfile(page)
    const picker = page.getByLabel('Escolher imagem do avatar')

    await picker.setInputFiles({ name: 'grande.png', mimeType: 'image/png', buffer: Buffer.alloc(300 * 1024) })
    await expect(page.getByText('A imagem deve ter até 200 KB.')).toBeVisible()
    await picker.setInputFiles({ name: 'notas.txt', mimeType: 'text/plain', buffer: Buffer.from('não é imagem') })
    await expect(page.getByText('Envie uma imagem PNG, JPEG ou WebP.')).toBeVisible()

    await picker.setInputFiles({ name: 'avatar.png', mimeType: 'image/png', buffer: PNG_1X1 })
    await expect(toast(page, 'Avatar atualizado.')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Seu avatar' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('img', { name: 'Seu avatar' })).toBeVisible()

    await page.getByRole('button', { name: 'Remover', exact: true }).click()
    await expect(toast(page, 'Avatar removido.')).toBeVisible()
    await expect(page.getByRole('img', { name: 'Seu avatar' })).toHaveCount(0)
  })

  test('altera a senha com validação, erro da API e novo login', async ({ page }) => {
    await openProfile(page)
    const current = page.getByLabel('Senha atual', { exact: true })
    const next = page.getByLabel('Nova senha', { exact: true })
    const confirm = page.getByLabel('Confirmar nova senha', { exact: true })
    const save = page.getByRole('button', { name: 'Salvar', exact: true })

    await next.fill('curta1')
    await confirm.fill('outra123')
    await save.click()
    await expect(page.getByText('Informe a senha atual')).toBeVisible()
    await expect(page.getByText('Mínimo de 8 caracteres')).toBeVisible()
    await expect(page.getByText('As senhas não conferem')).toBeVisible()
    await expect(current).toBeFocused()

    await current.fill('errada123')
    await next.fill('NovaSenha2026')
    await confirm.fill('NovaSenha2026')
    await save.click()
    await expect(page.getByText('Senha atual incorreta.')).toBeVisible()
    await expect(current).toHaveAttribute('aria-invalid', 'true')

    await current.fill('Kurio!2026')
    await save.click()
    await expect(toast(page, 'Senha alterada.')).toBeVisible()
    await expect(current).toHaveValue('')

    await page.getByRole('button', { name: 'Sair' }).filter({ visible: true }).click()
    await expect(page).toHaveURL('/')
    await page.goto('/login')
    await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
    await expect(page.getByText('E-mail ou senha incorretos.').filter({ visible: true })).toBeVisible()
    await page.getByLabel('Senha', { exact: true }).fill('NovaSenha2026')
    await page.getByRole('button', { name: 'Entrar', exact: true }).click()
    await page.waitForURL((url) => !url.pathname.startsWith('/login'))
  })

  test('edita a carteira principal com validação de endereço e ENS só na Ethereum', async ({ page }) => {
    await openWallets(page)
    const primary = page.getByRole('form', { name: 'Carteira principal' })
    await expect(primary.getByRole('textbox', { name: 'Nome ENS (opcional)' })).toBeVisible()

    const address = primary.getByRole('textbox', { name: 'Endereço da carteira' })
    await address.fill('0x123')
    await primary.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(primary.getByText('Endereço 0x inválido')).toBeVisible()
    await expect(address).toBeFocused()

    await address.fill('0x1111111111111111111111111111111111111111')
    await primary.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Cofre')
    await primary.getByRole('combobox', { name: 'Rede' }).click()
    await page.getByRole('option', { name: 'Polygon' }).click()
    await expect(primary.getByRole('textbox', { name: 'Nome ENS (opcional)' })).toHaveCount(0)
    await primary.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(toast(page, 'Carteira principal salva.')).toBeVisible()

    await page.reload()
    const reloaded = page.getByRole('form', { name: 'Carteira principal' })
    await expect(reloaded.getByRole('textbox', { name: 'Apelido da carteira' })).toHaveValue('Cofre')
    await expect(reloaded.getByRole('textbox', { name: 'Endereço da carteira' })).toHaveValue('0x1111111111111111111111111111111111111111')
    await expect(reloaded.getByRole('combobox', { name: 'Rede' })).toHaveText('Polygon')
  })

  test('cadastra carteira principal e secundária igual à principal a partir do vazio', async ({ page }) => {
    await openWallets(page, 'bruno@kurio.test')
    await expect(page.getByText('Você ainda não adicionou uma carteira secundária.')).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Igual à carteira principal' })).toBeDisabled()

    const primary = page.getByRole('form', { name: 'Carteira principal' })
    await primary.getByRole('button', { name: 'Salvar carteira' }).click()
    const alias = primary.getByRole('textbox', { name: 'Apelido da carteira' })
    await expect(alias).toBeFocused()
    await expect(primary.getByText('Informe a rede')).toBeVisible()
    await expect(primary.getByText('Informe o endereço da carteira')).toBeVisible()
    await expect(primary.getByText('Informe o tipo de carteira')).toBeVisible()

    await alias.fill('Principal')
    await primary.getByRole('combobox', { name: 'Rede' }).click()
    await page.getByRole('option', { name: 'Ethereum' }).click()
    await primary.getByRole('textbox', { name: 'Endereço da carteira' }).fill('0x2222222222222222222222222222222222222222')
    await primary.getByRole('combobox', { name: 'Tipo de carteira' }).click()
    await page.getByRole('option', { name: 'MetaMask' }).click()
    await primary.getByRole('textbox', { name: 'Nome ENS (opcional)' }).fill('bruno.eth')
    await primary.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(toast(page, 'Carteira principal salva.')).toBeVisible()

    await page.getByRole('checkbox', { name: 'Igual à carteira principal' }).click()
    await page.getByRole('button', { name: 'Adicionar' }).click()
    const secondary = page.getByRole('form', { name: 'Carteira secundária' })
    await expect(secondary.getByRole('textbox', { name: 'Endereço da carteira' })).toHaveValue('0x2222222222222222222222222222222222222222')
    await secondary.getByRole('textbox', { name: 'Apelido da carteira' }).fill('Reserva')
    await secondary.getByRole('button', { name: 'Salvar carteira' }).click()
    await expect(toast(page, 'Carteira secundária salva.')).toBeVisible()

    await page.reload()
    await expect(page.getByRole('form', { name: 'Carteira principal' }).getByRole('textbox', { name: 'Apelido da carteira' })).toHaveValue('Principal')
    await expect(page.getByRole('form', { name: 'Carteira secundária' }).getByRole('textbox', { name: 'Apelido da carteira' })).toHaveValue('Reserva')
  })
})
