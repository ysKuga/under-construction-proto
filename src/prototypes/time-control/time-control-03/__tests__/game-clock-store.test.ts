import { createGameClockStore } from '../_stores/game-clock'
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

test('後から tick する actor は、共通到達点 (commonGameTimeMs) に自分の advanceTickMs を加算した値になる', () => {
  const store = createGameClockStore()

  // A が 300ms まで進む (tickMs=100 で3回)
  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      100,
    )
  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 2, y: 0 } },
      100,
    )
  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'resolution', target: { x: 3, y: 0 } },
      100,
    )

  // 続けて B が tickMs=150 で行動決定すると、A の到達点 (300) に加算される
  const eventB = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'b', phase: 'execution', target: { x: 0, y: 1 } },
      150,
    )

  expect(eventB.gameTimeMs).toBe(450)
  expect(store.getState().commonGameTimeMs).toBe(450)
})

test('同一 actor の tick は累積し、後退・重複しない', () => {
  const store = createGameClockStore()

  const event1 = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      100,
    )
  const event2 = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 2, y: 0 } },
      100,
    )

  expect(event1.gameTimeMs).toBe(100)
  expect(event2.gameTimeMs).toBe(200)
})

test('getHistory は eventLog を対象に履歴行を生成する', () => {
  const store = createGameClockStore()

  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      100,
    )

  expect(store.getState().getHistory(['a'])).toEqual([
    {
      entryByActorId: {
        a: {
          actorId: 'a',
          gameTimeMs: 100,
          phase: 'execution',
          target: { x: 1, y: 0 },
        },
      },
      gameTimeMs: 100,
    },
  ])
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
