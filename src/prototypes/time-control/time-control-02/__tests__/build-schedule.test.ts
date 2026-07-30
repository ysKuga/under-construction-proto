import { buildSchedule } from '../_lib/build-schedule'
import { BASE_TICK_MS } from '../_lib/get-tick-ms'

test('空の経路しかない場合は空配列を返す', () => {
  const schedule = buildSchedule(['a'], {}, {}, {})

  expect(schedule).toEqual([])
})

test('単一 actor の経路は tickMs の倍数で行が並ぶ', () => {
  const movePathById = {
    a: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
  }
  const tickRateById = { a: BASE_TICK_MS / 100 } // tickMs = 100

  const schedule = buildSchedule(['a'], movePathById, {}, tickRateById)

  expect(schedule).toEqual([
    { actorIds: ['a'], timeMs: 100 },
    { actorIds: ['a'], timeMs: 200 },
  ])
})

test('同時刻の tick は1行にまとめられる', () => {
  // A: tickMs=100 -> 100,200,300 / B: tickMs=150 -> 150,300
  const movePathById = {
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
  const tickRateById = {
    a: BASE_TICK_MS / 100,
    b: BASE_TICK_MS / 150,
  }

  const schedule = buildSchedule(['a', 'b'], movePathById, {}, tickRateById)

  expect(schedule).toEqual([
    { actorIds: ['a'], timeMs: 100 },
    { actorIds: ['b'], timeMs: 150 },
    { actorIds: ['a'], timeMs: 200 },
    { actorIds: ['a', 'b'], timeMs: 300 },
  ])
})

test('tickCountById の累積値から続けて数える (履歴と衝突しない)', () => {
  const movePathById = { a: [{ x: 1, y: 0 }] }
  const tickRateById = { a: BASE_TICK_MS / 100 } // tickMs = 100

  const schedule = buildSchedule(['a'], movePathById, { a: 3 }, tickRateById)

  expect(schedule).toEqual([{ actorIds: ['a'], timeMs: 400 }])
})
