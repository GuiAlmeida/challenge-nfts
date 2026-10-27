import type { Page } from '@playwright/test'

export async function openWithMocks(page: Page, url: string): Promise<void> {
  await page.goto(url)
  await page.waitForFunction(() => window.__kurioMocksReady === true)
}

export const cards = (page: Page) => page.getByTestId('nft-card')

export async function searchFor(page: Page, isMobile: boolean, text: string): Promise<void> {
  if (isMobile) {
    const box = page.getByRole('searchbox', { name: 'Buscar NFTs' })
    await box.fill(text)
    await box.press('Enter')
    return
  }
  await page.getByRole('button', { name: 'Abrir busca' }).click()
  const box = page.getByRole('textbox', { name: 'Buscar NFTs' })
  await box.fill(text)
  await box.press('Enter')
}

export async function toggleCollection(page: Page, isMobile: boolean, label: string): Promise<void> {
  if (isMobile) await page.getByRole('button', { name: /^Filtros/ }).click()
  await page.getByRole('checkbox', { name: label }).click()
  if (isMobile) await page.keyboard.press('Escape')
}

export const priceOf = async (card: ReturnType<typeof cards>) => {
  const text = await card.innerText()
  const match = /(\d+\.\d+) ETH/.exec(text)
  return match ? Number(match[1]) : Number.NaN
}

export async function fillLogin(page: Page, email: string, password: string): Promise<void> {
  await page.getByRole('textbox', { name: 'E-mail' }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

export async function signIn(page: Page, email = 'ana@kurio.test', password = 'Kurio!2026'): Promise<void> {
  await page.goto('/login')
  await fillLogin(page, email, password)
  await page.waitForURL((url) => !url.pathname.startsWith('/login'))
}
