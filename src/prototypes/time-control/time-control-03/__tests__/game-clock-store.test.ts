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

test('同じ tickMs の複数 actor が同じタイミングで tick すると同一 gameTimeMs になる', () => {
  const store = createGameClockStore()

  const eventA = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 1, y: 0 } },
      100,
    )
  const eventB = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'b', phase: 'execution', target: { x: 0, y: 1 } },
      100,
    )

  expect(eventA.gameTimeMs).toBe(100)
  expect(eventB.gameTimeMs).toBe(100)
  expect(store.getState().commonGameTimeMs).toBe(100)
})

test('tickMs が異なる actor は互いの進行状況に引きずられず、それぞれ自分のペースで進む', () => {
  const store = createGameClockStore()

  // 1 step 目: A,B は tickMs=100 -> 100、C は tickMs=150 -> 150
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
  store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'c', phase: 'execution', target: { x: 0, y: 0 } },
      150,
    )

  // 2 step 目: C の 150 到達が A,B の次の到達値 (200) を汚染してはいけない
  const eventA2 = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'a', phase: 'execution', target: { x: 2, y: 0 } },
      100,
    )
  const eventB2 = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'b', phase: 'execution', target: { x: 0, y: 2 } },
      100,
    )
  const eventC2 = store
    .getState()
    .logEvent<ActionLogEntry>(
      { actorId: 'c', phase: 'execution', target: { x: 0, y: 0 } },
      150,
    )

  expect(eventA2.gameTimeMs).toBe(200)
  expect(eventB2.gameTimeMs).toBe(200)
  expect(eventC2.gameTimeMs).toBe(300)
  expect(store.getState().commonGameTimeMs).toBe(300)
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
