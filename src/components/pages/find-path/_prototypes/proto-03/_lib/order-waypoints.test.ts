import { expect, test } from 'vitest'

import { orderWaypoints } from './order-waypoints'

test('中継点なしは空配列を返す', () => {
  expect(orderWaypoints({ q: 0, r: 0 }, [])).toEqual([])
})

test('設置順でなく、直前地点から近い順に並べる', () => {
  const waypoints = [
    { q: 4, r: 0 },
    { q: 1, r: 0 },
    { q: 2, r: 0 },
  ]

  expect(orderWaypoints({ q: 0, r: 0 }, waypoints)).toEqual([
    { q: 1, r: 0 },
    { q: 2, r: 0 },
    { q: 4, r: 0 },
  ])
})

test('起点からの距離でなく、直前に経由した中継点からの距離で次を選ぶ', () => {
  // 起点からの距離順なら (2,0) → (-3,0) → (4,0) だが、(2,0) 経由後は (4,0) が近い
  const waypoints = [
    { q: -3, r: 0 },
    { q: 2, r: 0 },
    { q: 4, r: 0 },
  ]

  expect(orderWaypoints({ q: 0, r: 0 }, waypoints)).toEqual([
    { q: 2, r: 0 },
    { q: 4, r: 0 },
    { q: -3, r: 0 },
  ])
})

test('距離が同じ場合は設置順を優先する', () => {
  const waypoints = [
    { q: 0, r: 1 },
    { q: 1, r: 0 },
  ]

  expect(orderWaypoints({ q: 0, r: 0 }, waypoints)).toEqual([
    { q: 0, r: 1 },
    { q: 1, r: 0 },
  ])
})

test('引数の配列を変更しない', () => {
  const waypoints = [
    { q: 2, r: 0 },
    { q: 1, r: 0 },
  ]

  orderWaypoints({ q: 0, r: 0 }, waypoints)

  expect(waypoints).toEqual([
    { q: 2, r: 0 },
    { q: 1, r: 0 },
  ])
})
