import { describe, expect, it } from 'vitest'
import {
  clampQuantity,
  defaultEditionId,
  ethToStep,
  formatPriceLabel,
  hasActiveFilters,
  maxQuantityFor,
  pageWindow,
  patchSearch,
  priceStepsFrom,
  stepToEth,
  toggleCsvValue,
} from '../catalog.rules'
import type { CatalogSearch } from '@/contracts/search'

const base: CatalogSearch = { page: 3, sort: 'recent', tab: 'all' }

describe('patchSearch', () => {
  it('zera a página ao mudar qualquer filtro', () => {
    expect(patchSearch(base, { collection: 'musica' }).page).toBe(1)
    expect(patchSearch(base, { sort: 'price_asc' }).page).toBe(1)
    expect(patchSearch(base, { q: 'ape', page: 7 }).page).toBe(1)
  })
  it('mantém a página quando só a página muda', () => {
    expect(patchSearch(base, { page: 5 }).page).toBe(5)
  })
  it('preenche defaults quando o estado anterior é parcial', () => {
    expect(patchSearch({}, { collection: 'musica' })).toEqual({
      q: undefined,
      collection: 'musica',
      network: undefined,
      priceMin: undefined,
      priceMax: undefined,
      sort: 'recent',
      tab: 'all',
      page: 1,
    })
  })
})

describe('toggleCsvValue', () => {
  it('adiciona, remove e esvazia', () => {
    expect(toggleCsvValue(undefined, 'a')).toBe('a')
    expect(toggleCsvValue('a', 'b')).toBe('a,b')
    expect(toggleCsvValue('a,b', 'a')).toBe('b')
    expect(toggleCsvValue('b', 'b')).toBeUndefined()
  })
})

describe('hasActiveFilters', () => {
  it('ignora página e ordenação', () => {
    expect(hasActiveFilters(base)).toBe(false)
    expect(hasActiveFilters({ ...base, sort: 'price_desc' })).toBe(false)
    expect(hasActiveFilters({ ...base, tab: 'new' })).toBe(true)
    expect(hasActiveFilters({ ...base, q: 'x' })).toBe(true)
  })
})

describe('pageWindow', () => {
  it('centraliza e respeita os limites', () => {
    expect(pageWindow(1, 4)).toEqual([1, 2, 3, 4])
    expect(pageWindow(5, 10)).toEqual([3, 4, 5, 6, 7])
    expect(pageWindow(10, 10)).toEqual([6, 7, 8, 9, 10])
    expect(pageWindow(1, 0)).toEqual([])
  })
})

describe('quantidade por edição', () => {
  it('limita pelo menor entre disponível e máximo por pedido', () => {
    expect(maxQuantityFor({ available: 42, maxPerOrder: 10 })).toBe(10)
    expect(maxQuantityFor({ available: 2, maxPerOrder: 10 })).toBe(2)
    expect(maxQuantityFor({ available: 0, maxPerOrder: 1 })).toBe(0)
    expect(clampQuantity(99, 10)).toBe(10)
    expect(clampQuantity(0, 10)).toBe(1)
    expect(clampQuantity(3, 0)).toBe(0)
  })
  it('escolhe a edição mais barata com estoque', () => {
    const editions = [
      { id: 'a', available: 0, price: '0.50' },
      { id: 'b', available: 3, price: '2.00' },
      { id: 'c', available: 9, price: '1.00' },
      { id: 'd', available: 9, price: '1.00' },
    ] as never
    expect(defaultEditionId(editions)).toBe('c')
    expect(defaultEditionId([])).toBeNull()
  })
})

describe('slider de preço em passos de 0,01 ETH', () => {
  it('converte ida e volta sem float', () => {
    expect(ethToStep('12.30')).toBe(1230)
    expect(ethToStep('0.025', 'floor')).toBe(2)
    expect(ethToStep('0.025', 'ceil')).toBe(3)
    expect(stepToEth(1230)).toBe('12.30')
    expect(stepToEth(2)).toBe('0.02')
  })
  it('deriva a faixa selecionada da URL', () => {
    const range = { min: '0.02', max: '12.30' }
    expect(priceStepsFrom(range, {})).toEqual({ bounds: [2, 1230], value: [2, 1230] })
    expect(priceStepsFrom(range, { priceMin: '1', priceMax: '2.5' }).value).toEqual([100, 250])
    expect(priceStepsFrom(range, { priceMin: '50' }).value).toEqual([1230, 1230])
  })
  it('formata o rótulo como o Figma', () => {
    expect(formatPriceLabel('12.3')).toBe('12,30')
    expect(formatPriceLabel('0.025')).toBe('0,02')
  })
})
