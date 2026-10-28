import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import path from 'node:path'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import desktopConfig from '../lighthouse/config.desktop.mjs'
import mobileConfig from '../lighthouse/config.mobile.mjs'

const require = createRequire(import.meta.url)
const BASE = process.env.LH_BASE_URL ?? 'http://localhost:4173'
const RUNS = Number(process.env.LH_RUNS ?? 3)
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'nft-detail', path: process.env.LH_DETAIL_PATH ?? '/nft/emerald-ape-042' },
]
const PROFILES = [
  { name: 'mobile', config: mobileConfig },
  { name: 'desktop', config: desktopConfig },
]
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo']
const OUT = path.resolve(process.env.LH_OUT ?? 'lighthouse/reports')

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.on('error', reject)
    server.listen(0, () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
  })

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const port = await freePort()
  const browser = await chromium.launch({ channel: 'chromium', args: [`--remote-debugging-port=${port}`] })
  const browserVersion = browser.version()
  const summary = []
  const conditions = {}
  try {
    for (const page of PAGES) {
      for (const profile of PROFILES) {
        const scores = Object.fromEntries(CATEGORIES.map((c) => [c, []]))
        const metrics = { lcp: [], cls: [], tbt: [] }
        for (let run = 1; run <= RUNS; run++) {
          const result = await lighthouse(`${BASE}${page.path}`, { port, output: ['html', 'json'], logLevel: 'error' }, profile.config)
          const lhr = result.lhr
          const { throttling, screenEmulation, throttlingMethod } = lhr.configSettings
          conditions[profile.name] =
            `${screenEmulation.width}x${screenEmulation.height} a ${screenEmulation.deviceScaleFactor}x, RTT ${throttling.rttMs} ms, ` +
            `${(throttling.throughputKbps / 1024).toFixed(1)} Mbps, CPU ${throttling.cpuSlowdownMultiplier}x (${throttlingMethod})`
          const stem = path.join(OUT, `${page.name}-${profile.name}-run${run}`)
          await writeFile(`${stem}.html`, result.report[0])
          await writeFile(`${stem}.json`, result.report[1])
          for (const c of CATEGORIES) scores[c].push(Math.round((lhr.categories[c]?.score ?? 0) * 100))
          metrics.lcp.push(lhr.audits['largest-contentful-paint']?.numericValue ?? 0)
          metrics.cls.push(lhr.audits['cumulative-layout-shift']?.numericValue ?? 0)
          metrics.tbt.push(lhr.audits['total-blocking-time']?.numericValue ?? 0)
          console.log(`${page.name}/${profile.name} run ${run}:`, CATEGORIES.map((c) => `${c}=${scores[c].at(-1)}`).join(' '))
        }
        summary.push({
          page: page.name,
          profile: profile.name,
          scores: Object.fromEntries(CATEGORIES.map((c) => [c, median(scores[c])])),
          lcpMs: Math.round(median(metrics.lcp)),
          cls: Number(median(metrics.cls).toFixed(3)),
          tbtMs: Math.round(median(metrics.tbt)),
        })
      }
    }
  } finally {
    await browser.close()
  }
  const lhVersion = require('lighthouse/package.json').version
  const lines = [
    '# Lighthouse: resumo (mediana de ' + RUNS + ' execuções)',
    '',
    `- Data: ${new Date().toISOString()} · Lighthouse ${lhVersion} · Node ${process.version} · Chromium ${browserVersion} (Playwright)`,
    `- URL base: ${BASE} · build demo (\`pnpm build:demo\`, mocks ativos, cenário default)`,
    ...Object.entries(conditions).map(([name, value]) => `- Condições ${name}: ${value}`),
    '',
    '| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS | TBT (ms) |',
    '|---|---|---|---|---|---|---|---|---|',
    ...summary.map(
      (s) =>
        `| ${s.page} | ${s.profile} | ${s.scores.performance} | ${s.scores.accessibility} | ${s.scores['best-practices']} | ${s.scores.seo} | ${s.lcpMs} | ${s.cls} | ${s.tbtMs} |`,
    ),
    '',
    'Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.',
  ]
  const analysis = await readFile(path.resolve('lighthouse/analysis.md'), 'utf8').catch(() => '')
  await writeFile(path.join(OUT, 'summary.md'), [...lines, '', analysis.trim()].join('\n').trim() + '\n')
  await writeFile(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2))
  console.log(lines.join('\n'))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
