import { describe, expect, it } from 'vitest'

import { isHexAdjacent } from '../_lib/hex'

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
