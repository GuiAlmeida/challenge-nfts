import { expect, type Page } from '@playwright/test'

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

export async function addToCart(page: Page, isMobile: boolean, nftId: string): Promise<void> {
  await page.goto(`/nft/${nftId}`)
  await page.getByRole('button', { name: isMobile ? 'Adicionar ao carrinho' : 'ADICIONAR AO CARRINHO', exact: true }).click()
  if (isMobile) {
    await expect(page.getByText('Adicionado ao carrinho').filter({ visible: true })).toBeVisible()
    return
  }
  await expect(page.getByRole('dialog', { name: 'Resumo do carrinho' })).toBeVisible()
  await page.keyboard.press('Escape')
}

export async function connectWallet(page: Page, provider = 'MetaMask'): Promise<void> {
  await page.getByRole('radio', { name: provider, exact: true }).click()
  await expect(page.getByText(`${provider} conectada.`).filter({ visible: true })).toBeVisible()
}

export async function placeOrder(page: Page): Promise<string> {
  await page.goto('/checkout')
  await connectWallet(page)
  await page.getByRole('button', { name: 'Confirmar compra' }).click()
  await page.waitForURL(/\/orders\/ord_/)
  return new URL(page.url()).pathname.split('/').pop() ?? ''
}

export async function openCollectorData(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Confirmar compra' }).waitFor()
  const summary = page.getByText('Dados do colecionador', { exact: true })
  if (!(await summary.isVisible())) return
  const open = await page.locator('details', { has: summary }).evaluate((el) => (el as HTMLDetailsElement).open)
  if (!open) await summary.click()
}
