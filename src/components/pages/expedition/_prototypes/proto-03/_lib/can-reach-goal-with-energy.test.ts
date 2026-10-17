import { expect, test } from 'vitest'

import { colRowToAxial } from '@/prototypes/stage/stage-07/_lib/hex'

import { StageLayout } from '../_contexts/stage-layout/types'

import {
  canReachGoalWithEnergy,
  StageEnergyRule,
} from './can-reach-goal-with-energy'

/** 1 行のグリッド（列番号 = 開始からの距離） */
const GRID = { cols: 16, rows: 1 }

const RULE: StageEnergyRule = {
  carryCapacity: 3,
  consumePerMove: 1,
  current: 10,
  max: 10,
}

/** 1 行グリッドの列 col のセル */
const at = (col: number) => colRowToAxial(col, 0)

/** 開始が列 0、ゴールが列 goalCol の盤面 */
const createLayout = (
  goalCol: number,
  overrides: Partial<StageLayout> = {},
): StageLayout => ({
  goal: at(goalCol),
  items: [],
  obstacles: [],
  oneWays: [],
  spots: [],
  start: at(0),
  ...overrides,
})

test('EN の範囲内の距離なら到達できる', () => {
  expect(canReachGoalWithEnergy(createLayout(10), GRID, RULE)).toBe(true)
})

test('EN を超える距離なら到達できない', () => {
  expect(canReachGoalWithEnergy(createLayout(11), GRID, RULE)).toBe(false)
})

test('障害物で道が塞がれていれば到達できない', () => {
  const layout = createLayout(3, { obstacles: [at(2)] })

  expect(canReachGoalWithEnergy(layout, GRID, RULE)).toBe(false)
})

test('携行したアイテムを EN が減ってから使えば到達できる', () => {
  // 拾った直後（EN 9）に使うと 2 溢れて届かない。EN 7 以下で使えば 13 マス進める
  const layout = createLayout(13, { items: [{ ...at(1), amount: 3 }] })

  expect(canReachGoalWithEnergy(layout, GRID, RULE)).toBe(true)
})

test('携行上限が 0 ならアイテムを拾えず到達できない', () => {
  const layout = createLayout(11, { items: [{ ...at(1), amount: 3 }] })

  expect(
    canReachGoalWithEnergy(layout, GRID, { ...RULE, carryCapacity: 0 }),
  ).toBe(false)
})

test('スポットで補給すれば到達できる', () => {
  const layout = createLayout(11, {
    spots: [{ ...at(1), amount: 1, stock: 4 }],
  })

  expect(canReachGoalWithEnergy(layout, GRID, RULE)).toBe(true)
})

test('枯渇したスポットでは補給できず到達できない', () => {
  const layout = createLayout(11, {
    spots: [{ ...at(1), amount: 1, stock: 0 }],
  })

  expect(canReachGoalWithEnergy(layout, GRID, RULE)).toBe(false)
})
