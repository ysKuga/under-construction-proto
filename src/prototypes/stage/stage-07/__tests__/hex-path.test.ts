import { describe, expect, it } from 'vitest'

import { HexCell } from '../_lib/hex'
import { findHexPath } from '../_lib/hex-path'

describe('findHexPath', () => {
  it('隣接セルへは1マスの経路を返す', () => {
    const path = findHexPath({ q: 0, r: 0 }, { q: 1, r: 0 }, 5, 5)

    expect(path).toEqual([{ q: 1, r: 0 }])
  })

  it('同一セルは空配列を返す', () => {
    const path = findHexPath({ q: 0, r: 0 }, { q: 0, r: 0 }, 5, 5)

    expect(path).toEqual([])
  })

  it('非隣接セルへは最短経路を返す(start は含まない、goal で終わる)', () => {
    const path = findHexPath({ q: 0, r: 0 }, { q: 3, r: 0 }, 5, 5)

    expect(path).toHaveLength(3)
    expect(path?.at(-1)).toEqual({ q: 3, r: 0 })
  })

  it('グリッド範囲外の goal は undefined を返す', () => {
    const path = findHexPath({ q: 0, r: 0 }, { q: 10, r: 10 }, 5, 5)

    expect(path).toBeUndefined()
  })

  it('canEnter が false を返すセルを迂回する', () => {
    // (1,0) を塞ぎ、(0,0) → (2,0) 方向の直進経路を迂回させる
    const blocked: HexCell = { q: 1, r: 0 }
    const canEnter = (_from: HexCell, to: HexCell) =>
      !(to.q === blocked.q && to.r === blocked.r)

    const path = findHexPath({ q: 0, r: 0 }, { q: 2, r: 0 }, 5, 5, canEnter)

    expect(path?.some((cell) => cell.q === 1 && cell.r === 0)).toBe(false)
    expect(path?.at(-1)).toEqual({ q: 2, r: 0 })
  })

  it('canEnter で完全に孤立した goal へは undefined を返す', () => {
    const goal: HexCell = { q: 1, r: 1 }
    const canEnter = (_from: HexCell, to: HexCell) =>
      !(to.q === goal.q && to.r === goal.r)

    const path = findHexPath({ q: 0, r: 0 }, goal, 5, 5, canEnter)

    expect(path).toBeUndefined()
  })
})
