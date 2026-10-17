import { expect, test } from 'vitest'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { findHexPathViaWaypoints } from './find-hex-path-via-waypoints'

const GRID = { cols: 5, rows: 5 }

test('中継点なしは start → objective の最短経路を返す', () => {
  const path = findHexPathViaWaypoints(
    { q: 0, r: 0 },
    [],
    { q: 3, r: 0 },
    GRID.cols,
    GRID.rows,
  )

  expect(path).toEqual([
    { q: 1, r: 0 },
    { q: 2, r: 0 },
    { q: 3, r: 0 },
  ])
})

test('中継点を最近傍順に経由し、objective で終わる経路を返す', () => {
  // 設置順は (0,2) → (0,1) だが、最近傍順で (0,1) → (0,2) と経由する
  const path = findHexPathViaWaypoints(
    { q: 0, r: 0 },
    [
      { q: 0, r: 2 },
      { q: 0, r: 1 },
    ],
    { q: 0, r: 3 },
    GRID.cols,
    GRID.rows,
  )

  expect(path).toEqual([
    { q: 0, r: 1 },
    { q: 0, r: 2 },
    { q: 0, r: 3 },
  ])
})

test('中継点を経由するため同じセルを再訪する経路も返す', () => {
  const path = findHexPathViaWaypoints(
    { q: 0, r: 0 },
    [{ q: 0, r: 2 }],
    { q: 0, r: 1 },
    GRID.cols,
    GRID.rows,
  )

  expect(path).toEqual([
    { q: 0, r: 1 },
    { q: 0, r: 2 },
    { q: 0, r: 1 },
  ])
})

test('いずれかの区間が到達不能なら undefined を返す', () => {
  const blocked: HexCell = { q: 1, r: 1 }
  const canEnter = (_from: HexCell, to: HexCell) =>
    !(to.q === blocked.q && to.r === blocked.r)

  const path = findHexPathViaWaypoints(
    { q: 0, r: 0 },
    [blocked],
    { q: 3, r: 0 },
    GRID.cols,
    GRID.rows,
    canEnter,
  )

  expect(path).toBeUndefined()
})
