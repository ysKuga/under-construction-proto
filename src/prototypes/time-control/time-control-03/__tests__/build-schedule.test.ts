import { getTickMs } from '../../time-control-02/_lib/get-tick-ms'
import { buildSchedule } from '../_lib/build-schedule'

test('空の経路しかない場合は空配列を返す', () => {
  const schedule = buildSchedule(['a'], {}, {}, 0)

  expect(schedule).toEqual([])
})

test('単一 actor の経路は tickMs の倍数で行が並ぶ', () => {
  const pathById = {
    a: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
  }
  const actorById = { a: { speed: 0.01, tickRate: 400 / 100 } } // tickMs = 100

  const schedule = buildSchedule(['a'], pathById, actorById, 0)

  expect(schedule).toEqual([
    { actorIds: ['a'], timeMs: 100 },
    { actorIds: ['a'], timeMs: 200 },
  ])
})

test('同時刻の tick は1行にまとめられる', () => {
  // A: tickMs=100 -> 100,200,300 / B: tickMs=150 -> 150,300
  const pathById = {
    a: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    b: [
      { x: 0, y: 1 },
      { x: 0, y: 2 },
    ],
  }
  const actorById = {
    a: { speed: 0.01, tickRate: 400 / 100 },
    b: { speed: 0.01, tickRate: 400 / 150 },
  }

  const schedule = buildSchedule(['a', 'b'], pathById, actorById, 0)

  expect(schedule).toEqual([
    { actorIds: ['a'], timeMs: 100 },
    { actorIds: ['b'], timeMs: 150 },
    { actorIds: ['a'], timeMs: 200 },
    { actorIds: ['a', 'b'], timeMs: 300 },
  ])
})

test('commonGameTimeMs を起点に続けて数える (履歴と連続する)', () => {
  const pathById = { a: [{ x: 1, y: 0 }] }
  const actorById = { a: { speed: 0.01, tickRate: 400 / 100 } } // tickMs = 100

  const schedule = buildSchedule(['a'], pathById, actorById, 300)

  expect(schedule).toEqual([{ actorIds: ['a'], timeMs: 400 }])
})

test('getTickMs との整合 (BASE_TICK_MS 由来の tickRate)', () => {
  const pathById = { a: [{ x: 1, y: 0 }] }
  const tickRate = 2
  const actorById = { a: { speed: 0.01, tickRate } }

  const schedule = buildSchedule(['a'], pathById, actorById, 0)

  expect(schedule).toEqual([{ actorIds: ['a'], timeMs: getTickMs(tickRate) }])
})
