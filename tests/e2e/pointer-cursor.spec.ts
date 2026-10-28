import { expect, type Page, test } from '@playwright/test'
import { openWithMocks, signIn } from './helpers'

const INTERACTIVE =
  'a[href], button, summary, select, input[type=checkbox], input[type=radio], label:has([role=checkbox], [role=radio], input[type=checkbox], input[type=radio]), [role=button], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=tab], [role=checkbox], [role=radio]'

async function wrongCursors(page: Page): Promise<string[]> {
  return page.evaluate((selector) => {
    const wrong: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      if (rect.width === 0 || rect.height === 0 || style.visibility === 'hidden' || style.pointerEvents === 'none') continue
      const disabled =
        el.matches(':disabled, [aria-disabled="true"], [data-disabled]:not([data-disabled="false"])') ||
        (el.tagName === 'LABEL' && el.querySelector(':disabled') !== null)
      const expected = disabled ? 'not-allowed' : 'pointer'
      if (style.cursor !== expected) {
        const name = (el.getAttribute('aria-label') ?? el.textContent ?? el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40)
        wrong.push(`${el.tagName.toLowerCase()} "${name}": ${style.cursor} (esperado ${expected})`)
      }
    }
    return wrong
  }, INTERACTIVE)
}

test.describe('cursor de elementos clicáveis', () => {
  test.skip(({ isMobile }) => isMobile, 'cursor só existe com mouse')

  test('links, botões, menus e opções mostram a mão; desabilitados mostram bloqueio', async ({ page }) => {
    await openWithMocks(page, '/?mock-reset=1')
    expect(await wrongCursors(page)).toEqual([])

    await page.getByRole('combobox', { name: 'Ordenar por' }).click()
    await expect(page.getByRole('option').first()).toBeVisible()
    expect(await wrongCursors(page)).toEqual([])
    await page.keyboard.press('Escape')

    await signIn(page)
    await page.getByRole('button', { name: /^Conta de/ }).click()
    await expect(page.getByRole('menuitem', { name: 'Carteiras' })).toBeVisible()
    expect(await wrongCursors(page)).toEqual([])
    await page.keyboard.press('Escape')

    await page.goto('/account/wallets')
    await page.getByRole('form', { name: 'Carteira principal' }).getByRole('combobox', { name: 'Rede' }).click()
    await expect(page.getByRole('option', { name: 'Polygon' })).toBeVisible()
    expect(await wrongCursors(page)).toEqual([])
  })
})
