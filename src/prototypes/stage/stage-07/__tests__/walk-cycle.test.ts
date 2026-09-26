import { describe, expect, it } from 'vitest'

import { computeWalkCycleSec } from '../_lib/walk-cycle'

/** 連続移動時の 1 マスあたり歩数(1 周期 = 2 歩) */
const stepsPerCell = (moveDurationMs: number, cycleSec: number) =>
  ((moveDurationMs / 1000) * 2) / cycleSec

describe('computeWalkCycleSec', () => {
  it('指数 1 なら移動時間の 2 倍(上限で頭打ち)と一致する', () => {
    expect(computeWalkCycleSec(300, 1.2, 1)).toBeCloseTo(0.6)
    expect(computeWalkCycleSec(1000, 1.2, 1)).toBeCloseTo(1.2)
  })

  it('上限に達する移動時間以上では上限を返す', () => {
    expect(computeWalkCycleSec(600, 1.2, 1.5)).toBeCloseTo(1.2)
    expect(computeWalkCycleSec(3000, 1.2, 1.5)).toBeCloseTo(1.2)
  })

  it('指数 1 超なら移動時間が短いほど 1 マスあたり歩数が増える', () => {
    const slow = stepsPerCell(500, computeWalkCycleSec(500, 1.2, 1.5))
    const fast = stepsPerCell(150, computeWalkCycleSec(150, 1.2, 1.5))

    expect(slow).toBeGreaterThan(1)
    expect(fast).toBeGreaterThan(slow)
  })
})
