import { describe, expect, it } from 'vitest'

import { hexDistance, isHexAdjacent } from '../_lib/hex'

describe('isHexAdjacent', () => {
  it.each([
    { q: 1, r: 0 },
    { q: 1, r: -1 },
    { q: 0, r: -1 },
    { q: -1, r: 0 },
    { q: -1, r: 1 },
    { q: 0, r: 1 },
  ])('隣接6方向 %o は隣接と判定する', (offset) => {
    const origin = { q: 0, r: 0 }
    const target = { q: offset.q, r: offset.r }

    expect(isHexAdjacent(origin, target)).toBe(true)
  })

  it('同一セルは隣接でない', () => {
    expect(isHexAdjacent({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(false)
  })

  it('2マス離れたセルは隣接でない', () => {
    expect(isHexAdjacent({ q: 0, r: 0 }, { q: 2, r: 0 })).toBe(false)
  })

  it('斜め6方向以外(対角)は隣接でない', () => {
    expect(isHexAdjacent({ q: 0, r: 0 }, { q: 1, r: 1 })).toBe(false)
  })
})

describe('hexDistance', () => {
  it('同一セルは 0', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 0, r: 0 })).toBe(0)
  })

  it('隣接セルは 1', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: -1, r: 1 })).toBe(1)
  })

  it('q 軸方向に 3 マス離れたセルは 3', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 3, r: 0 })).toBe(3)
  })

  it('対角(1, 1)は隣接でなく 2', () => {
    expect(hexDistance({ q: 0, r: 0 }, { q: 1, r: 1 })).toBe(2)
  })

  it('引数の順序に依存しない', () => {
    const a = { q: 2, r: -1 }
    const b = { q: -1, r: 3 }

    expect(hexDistance(a, b)).toBe(hexDistance(b, a))
  })
})
