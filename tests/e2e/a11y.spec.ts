import AxeBuilder from '@axe-core/playwright'
import { expect, type Page, test } from '@playwright/test'
import { fillLogin, openWithMocks } from './helpers'

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function seriousViolations(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  return results.violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')
    .map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)
}

async function signInWithSeededCart(page: Page): Promise<void> {
  await openWithMocks(page, '/login?mock-reset=1&mock-scenario=cart-seeded')
  await fillLogin(page, 'ana@kurio.test', 'Kurio!2026')
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}

const hasHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)

test.describe('acessibilidade (README 11)', () => {
  test('páginas públicas sem violações sérias do axe', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await expect(page.getByTestId('nft-card').first()).toBeVisible()
    expect(await seriousViolations(page)).toEqual([])

    await page.goto('/nft/emerald-ape-042')
    await expect(page.locator('h1:visible')).toHaveText('Emerald Ape #042')
    expect(await seriousViolations(page)).toEqual([])

    await page.goto('/login')
    await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeVisible()
    expect(await seriousViolations(page)).toEqual([])
  })

  test('páginas logadas sem violações sérias do axe', async ({ page }) => {
    await signInWithSeededCart(page)
    await page.goto('/cart')
    await expect(page.getByTestId('cart-row').filter({ visible: true }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: 'Conectar e finalizar' }).filter({ visible: true })).not.toHaveAttribute('aria-disabled', 'true')
    expect(await seriousViolations(page)).toEqual([])

    await page.goto('/checkout')
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible()
    expect(await seriousViolations(page)).toEqual([])

    await page.goto('/account/profile')
    await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible()
    expect(await seriousViolations(page)).toEqual([])

    await page.goto('/account/wallets')
    await expect(page.getByRole('heading', { name: 'Carteira principal' })).toBeVisible()
    expect(await seriousViolations(page)).toEqual([])
  })

  test('link para pular ao conteúdo é o primeiro foco e leva ao conteúdo principal', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Pular para o conteúdo' })
    await expect(skip).toBeFocused()
    await page.keyboard.press('Enter')
    await page.keyboard.press('Tab')
    expect(await page.evaluate(() => document.getElementById('conteudo')?.contains(document.activeElement))).toBe(true)
  })

  test('validação por teclado foca o primeiro erro e liga a mensagem ao campo', async ({ page }) => {
    await openWithMocks(page, '/login?mock-reset=1')
    const email = page.getByRole('textbox', { name: 'E-mail' })
    await email.focus()
    await page.keyboard.press('Enter')
    await expect(email).toBeFocused()
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    const describedBy = (await email.getAttribute('aria-describedby')) ?? ''
    const messages = await page.evaluate(
      (ids) =>
        ids
          .split(' ')
          .map((id) => document.getElementById(id)?.textContent ?? '')
          .join(' '),
      describedBy,
    )
    expect(messages).toContain('Informe um e-mail válido')
  })

  test('diálogo prende o foco e Esc fecha devolvendo o foco', async ({ page, isMobile }) => {
    test.skip(isMobile, 'modal de login e mini carrinho existem só no desktop; a sheet de filtros é testada no mobile')
    await openWithMocks(page, '/login?mock-reset=1')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(page).toHaveURL('/')

    const cart = page.locator('[data-cart-anchor]')
    await cart.focus()
    await page.keyboard.press('Enter')
    const miniCart = page.getByRole('dialog', { name: 'Resumo do carrinho' })
    await expect(miniCart).toBeVisible()
    expect(await miniCart.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    await page.keyboard.press('Escape')
    await expect(miniCart).toBeHidden()
    await expect(cart).toBeFocused()
  })

  test('sheet de filtros no mobile prende o foco e Esc devolve ao botão', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'a sheet de filtros abre pelo botão do mobile')
    await openWithMocks(page, '/?mock-reset=1')
    const trigger = page.getByRole('button', { name: /^Filtros/ }).filter({ visible: true })
    await trigger.click()
    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }
    await page.keyboard.press('Escape')
    await expect(sheet).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test('sem rolagem horizontal de 320 a 1440', async ({ page, isMobile }) => {
    test.slow()
    const widths = isMobile ? [320, 360, 390] : [768, 1024, 1440]
    await signInWithSeededCart(page)
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 })
      for (const url of ['/', '/nft/emerald-ape-042', '/cart', '/checkout', '/account/profile', '/account/wallets']) {
        await page.goto(url)
        await page.waitForLoadState('networkidle')
        expect(await hasHorizontalScroll(page), `${url} em ${width}px`).toBe(false)
      }
    }
  })

  test('movimento reduzido desliga o shimmer dos skeletons', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openWithMocks(page, '/?mock-reset=1&mock-scenario=slow')
    const skeleton = page.locator('[data-slot="skeleton"]').first()
    await expect(skeleton).toBeAttached()
    expect(await skeleton.evaluate((el) => getComputedStyle(el, '::after').animationDuration)).toBe('1e-05s')
  })
})
