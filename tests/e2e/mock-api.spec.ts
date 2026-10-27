import { expect, test, type Page } from '@playwright/test'

type Json = Record<string, unknown>

const openWithMocks = async (page: Page, url: string) => {
  await page.goto(url)
  await page.waitForFunction(() => window.__kurioMocksReady === true)
}

const api = async (page: Page, path: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) =>
  page.evaluate(
    async ({ path, init }) => {
      const res = await fetch(`/api${path}`, {
        method: init.method ?? 'GET',
        headers: { 'content-type': 'application/json', ...(init.headers ?? {}) },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
      })
      const text = await res.text()
      return { status: res.status, body: text ? (JSON.parse(text) as unknown) : null }
    },
    { path, init },
  )

test.describe('backend simulado (MSW REST)', () => {
  test('catálogo: lista, facets, filtros, detalhe e 404', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=default')
    const list = await api(page, '/nfts')
    expect(list.status).toBe(200)
    const body = list.body as Json
    expect((body.items as unknown[]).length).toBe(9)
    expect(body.total).toBe(36)
    expect((body.items as Json[])[0]?.name).toBe('Emerald Ape #042')
    expect((body.items as Json[])[0]?.price).toBe('1.19')

    const filtered = await api(page, '/nfts?collection=musica&sort=price_asc')
    const items = (filtered.body as Json).items as Json[]
    expect(items.every((i) => (i.collection as Json).slug === 'musica')).toBe(true)
    const prices = items.map((i) => Number(i.price))
    expect(prices).toEqual([...prices].sort((a, b) => a - b))

    const empty = await api(page, '/nfts?q=zzzz-nao-existe')
    expect((empty.body as Json).total).toBe(0)

    const detail = await api(page, '/nfts/emerald-ape-042')
    expect(detail.status).toBe(200)
    expect(((detail.body as Json).editions as unknown[]).length).toBe(4)

    const missing = await api(page, '/nfts/nao-existe')
    expect(missing.status).toBe(404)
    expect(((missing.body as Json).error as Json).code).toBe('NOT_FOUND')
  })

  test('auth, favoritos, carrinho, cotação e pedido confirmado', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=cart-seeded')

    const bad = await api(page, '/auth/login', {
      method: 'POST',
      body: { email: 'ana@kurio.test', password: 'errada123' },
    })
    expect(bad.status).toBe(401)

    const login = await api(page, '/auth/login', {
      method: 'POST',
      body: { email: 'ana@kurio.test', password: 'Kurio!2026' },
    })
    expect(login.status).toBe(200)
    const token = (login.body as Json).token as string
    const auth = { authorization: `Bearer ${token}` }

    const favs = await api(page, '/me/favorites', { headers: auth })
    expect((favs.body as Json).nftIds).toEqual(['emerald-ape-042', 'violet-nomad-314'])

    const cart = await api(page, '/cart', { headers: auth })
    expect((cart.body as Json).subtotal).toBe('26.83')
    expect((cart.body as Json).itemCount).toBe(17)

    const overflow = await api(page, '/cart/items', {
      method: 'POST',
      headers: auth,
      body: { nftId: 'emerald-ape-042', editionId: 'emerald-ape-042:1of1', quantity: 2 },
    })
    expect(overflow.status).toBe(409)
    expect(((overflow.body as Json).error as Json).code).toBe('AVAILABILITY_CONFLICT')

    const quote = await api(page, '/cart/quote', { method: 'POST', headers: auth, body: {} })
    expect(quote.status).toBe(200)
    const q = quote.body as Json
    expect(q).toMatchObject({ subtotal: '26.83', discount: '0.00', networkFee: '0.016', total: '26.846' })

    const expired = await api(page, '/cart/quote', {
      method: 'POST',
      headers: auth,
      body: { couponCode: 'EXPIRADO' },
    })
    expect(((expired.body as Json).error as Json).code).toBe('COUPON_EXPIRED')
    const coupon = await api(page, '/cart/quote', {
      method: 'POST',
      headers: auth,
      body: { couponCode: 'KURIO10' },
    })
    expect((coupon.body as Json).discount).toBe('2.683')

    const wallets = await api(page, '/me/wallets', { headers: auth })
    const primary = ((wallets.body as Json).items as Json[]).find((w) => w.kind === 'primary')!
    const orderBody = {
      quoteId: q.quoteId,
      quoteVersion: q.version,
      walletId: primary.id,
      network: 'ethereum',
      customer: {
        displayName: 'Ana Lima',
        username: 'ana',
        profileName: 'Ana Lima',
        email: 'ana@kurio.test',
        network: 'ethereum',
        walletAddress: primary.address,
        walletProvider: 'metamask',
      },
    }
    const noKey = await api(page, '/orders', { method: 'POST', headers: auth, body: orderBody })
    expect(noKey.status).toBe(400)

    const key = { ...auth, 'idempotency-key': 'idem-1' }
    const created = await api(page, '/orders', { method: 'POST', headers: key, body: orderBody })
    expect(created.status).toBe(202)
    const orderId = (created.body as Json).id as string
    expect((created.body as Json).status).toBe('pending')

    const replay = await api(page, '/orders', { method: 'POST', headers: key, body: orderBody })
    expect(replay.status).toBe(200)
    expect((replay.body as Json).id).toBe(orderId)

    const conflict = await api(page, '/orders', {
      method: 'POST',
      headers: key,
      body: { ...orderBody, network: 'polygon' },
    })
    expect(conflict.status).toBe(409)
    expect(((conflict.body as Json).error as Json).code).toBe('IDEMPOTENCY_CONFLICT')

    await expect
      .poll(async () => ((await api(page, `/orders/${orderId}`, { headers: auth })).body as Json).status, {
        timeout: 10_000,
      })
      .toBe('confirmed')
    const confirmed = (await api(page, `/orders/${orderId}`, { headers: auth })).body as Json
    expect((confirmed.receipt as Json).total).toBe('26.846')
    expect(confirmed.txHash).toMatch(/^0x/)

    const cartAfter = await api(page, '/cart', { headers: auth })
    expect(((cartAfter.body as Json).items as unknown[]).length).toBe(0)

    const bruno = await api(page, '/auth/login', {
      method: 'POST',
      body: { email: 'bruno@kurio.test', password: 'Kurio!2026' },
    })
    const brunoAuth = { authorization: `Bearer ${(bruno.body as Json).token as string}` }
    const forbidden = await api(page, `/orders/${orderId}`, { headers: brunoAuth })
    expect(forbidden.status).toBe(403)
  })

  test('carrinho de visitante é mesclado no login e persiste após reload', async ({ page }) => {
    await openWithMocks(page, '/?mock-scenario=default')
    const guest = { 'x-cart-id': 'guest-abc' }
    const add = await api(page, '/cart/items', {
      method: 'POST',
      headers: guest,
      body: { nftId: 'golden-beat-207', editionId: 'golden-beat-207:open', quantity: 2 },
    })
    expect(add.status).toBe(201)
    await page.reload()
    await page.waitForFunction(() => window.__kurioMocksReady === true)
    const again = await api(page, '/cart', { headers: guest })
    expect((again.body as Json).itemCount).toBe(2)
    const login = await api(page, '/auth/login', {
      method: 'POST',
      headers: guest,
      body: { email: 'bruno@kurio.test', password: 'Kurio!2026' },
    })
    expect((login.body as Json).cartMerged).toBe(true)
    const merged = await api(page, '/cart', {
      headers: { authorization: `Bearer ${(login.body as Json).token as string}` },
    })
    expect((merged.body as Json).itemCount).toBe(2)
    expect((merged.body as Json).scope).toBe('user')
  })

  test('cenários: http-errors recupera após duas falhas e session-expired derruba em 15 s', async ({ page }) => {
    await openWithMocks(page, '/cart?mock-scenario=http-errors')
    expect((await api(page, '/nfts')).status).toBe(500)
    expect((await api(page, '/nfts')).status).toBe(500)
    expect((await api(page, '/nfts')).status).toBe(200)

    await openWithMocks(page, '/?mock-scenario=session-expired')
    const login = await api(page, '/auth/login', {
      method: 'POST',
      body: { email: 'ana@kurio.test', password: 'Kurio!2026' },
    })
    const auth = { authorization: `Bearer ${(login.body as Json).token as string}` }
    expect((await api(page, '/auth/session', { headers: auth })).status).toBe(200)
    await page.clock.install()
    await page.clock.fastForward(16_000)
    const expired = await api(page, '/auth/session', { headers: auth })
    expect(expired.status).toBe(401)
    expect(((expired.body as Json).error as Json).code).toBe('SESSION_EXPIRED')
  })
})
