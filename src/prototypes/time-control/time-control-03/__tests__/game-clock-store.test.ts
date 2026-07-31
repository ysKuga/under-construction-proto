import { createGameClockStore } from '../_stores/game-clock-store'
import { ActionLogEntry } from '../types'

test('advanceTickMs 省略時はクロックを進めず現在値をそのまま使う', () => {
  const store = createGameClockStore()

  const event = store.getState().logEvent<ActionLogEntry>({
    actorId: 'a',
    phase: 'intent',
    target: { x: 1, y: 0 },
  })

  expect(event.gameTimeMs).toBe(0)
  expect(store.getState().commonGameTimeMs).toBe(0)
})

test('advanceTickMs 指定時はクロックをその分進めてから新しい値を使う', () => {
  const store = createGameClockStore()

  const event = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      200,
    )

  expect(event.gameTimeMs).toBe(200)
  expect(store.getState().commonGameTimeMs).toBe(200)
})

test('複数 actor が断続的に tick を発生させても、決定順で単調増加し重複しない', () => {
  const store = createGameClockStore()

  // A, B が最初の行動決定で 200ms 到達 (100ms x 2 tick)
  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      100,
    )
  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'b', phase: 'execution', target: { x: 0, y: 1 } },
      100,
    )

  // 続けて C が行動決定 (C 自身は最初の tick でも、共通クロック上は継続する)
  const eventC = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'c', phase: 'execution', target: { x: 0, y: 0 } },
      100,
    )

  const gameTimeMsList = store
    .getState()
    .eventLog.map((entry) => entry.event.gameTimeMs)

  expect(gameTimeMsList).toEqual([100, 200, 300])
  expect(eventC.gameTimeMs).toBe(300)
  expect(new Set(gameTimeMsList).size).toBe(gameTimeMsList.length)
})

test('reset で eventLog・commonGameTimeMs が初期状態に戻る', () => {
  const store = createGameClockStore()

  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      100,
    )
  store.getState().reset()

  expect(store.getState().eventLog).toEqual([])
  expect(store.getState().commonGameTimeMs).toBe(0)
})
