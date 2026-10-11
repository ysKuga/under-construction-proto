import { expect, test } from 'vitest'

import { findHexPath } from '@/prototypes/stage/stage-07/_lib/hex-path'
import {
  colRowToAxial,
  hexDistance,
  HexCell,
  isHexCellInGrid,
} from '@/prototypes/stage/stage-07/_lib/hex'

import { StageLayout } from '../_contexts/stage-layout/types'

import { canEnterForPath } from './can-enter-for-path'
import { generateStage, GenerateStageParams } from './generate-stage'
import { isObstacleCell } from './obstacle'

const PARAMS: GenerateStageParams = {
  grid: { cols: 5, rows: 5 },
  items: { amount: 3, count: 1 },
  maxAttempts: 100,
  maxRelocations: 5,
  minGoalDistance: 3,
  obstacleCount: 3,
  oneWayCount: 2,
  spots: { amount: 1, count: 1, stock: 4 },
}

/** 盤面に置かれた全要素のセル */
const layoutCells = (layout: StageLayout): HexCell[] => [
  layout.start,
  layout.goal,
  ...layout.obstacles,
  ...layout.oneWays,
  ...layout.items,
  ...layout.spots,
]

/** seed 1〜100 で生成した盤面（生成できなかった seed は除く） */
const layouts = Array.from({ length: 100 }, (_, i) =>
  generateStage(i + 1, PARAMS),
).filter((layout) => layout !== undefined)

test('同じ seed からは同じ配置を返す', () => {
  expect(generateStage(42, PARAMS)).toEqual(generateStage(42, PARAMS))
})

test('seed が違えば配置も変わる', () => {
  expect(generateStage(1, PARAMS)).not.toEqual(generateStage(2, PARAMS))
})

test('指定した個数・補給量で配置する', () => {
  const layout = generateStage(1, PARAMS)!

  expect(layout.obstacles).toHaveLength(3)
  expect(layout.oneWays).toHaveLength(2)
  expect(layout.items).toEqual([expect.objectContaining({ amount: 3 })])
  expect(layout.spots).toEqual([
    expect.objectContaining({ amount: 1, stock: 4 }),
  ])
})

test('seed 1〜100 はすべて生成できる', () => {
  expect(layouts).toHaveLength(100)
})

test('要素はすべてグリッド内の互いに異なるセルに置く', () => {
  for (const layout of layouts) {
    const cells = layoutCells(layout)

    expect(cells.every((cell) => isHexCellInGrid(cell, 5, 5))).toBe(true)
    expect(new Set(cells.map((cell) => `${cell.q},${cell.r}`)).size).toBe(
      cells.length,
    )
  }
})

test('開始セルからゴールへ到達できる配置を返す', () => {
  for (const layout of layouts) {
    expect(
      findHexPath(layout.start, layout.goal, 5, 5, (from, to) =>
        canEnterForPath(from, to, layout),
      ),
    ).toBeDefined()
  }
})

test('開始セルとゴールを minGoalDistance 以上離す', () => {
  for (const layout of layouts) {
    expect(hexDistance(layout.start, layout.goal)).toBeGreaterThanOrEqual(3)
  }
})

test('障害物以外のセルはすべて開始セルから到達できる', () => {
  for (const layout of layouts) {
    for (let i = 0; i < 25; i++) {
      const cell = colRowToAxial(i % 5, Math.floor(i / 5))

      if (isObstacleCell(cell, layout)) continue

      expect(
        findHexPath(layout.start, cell, 5, 5, (from, to) =>
          canEnterForPath(from, to, layout),
        ),
      ).toBeDefined()
    }
  }
})

test('上限回数内に到達可能な配置が得られなければ undefined を返す', () => {
  expect(generateStage(1, { ...PARAMS, maxAttempts: 0 })).toBeUndefined()
})

test('要素数がセル数を超える場合は例外を投げる', () => {
  expect(() =>
    generateStage(1, { ...PARAMS, grid: { cols: 2, rows: 2 } }),
  ).toThrow('を超えている')
})
