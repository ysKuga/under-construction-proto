import { createActorStore } from '../_stores/actor-store'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('未移動 actor の position は保持されない', () => {
  const store = createActorStore()

  expect(store.getState().positionById.a).toBeUndefined()
})

test('dispatchMoveIntent は position を変更せず経路のみ生成する', () => {
  const store = createActorStore()

  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 6, y: 0 } })

  expect(store.getState().positionById.a).toBeUndefined()
  expect(store.getState().movePathById.a).toHaveLength(3)
})

test('dispatchMoveIntent は actionLog に intent のみ追加する', () => {
  const store = createActorStore()

  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 1, y: 1 } })

  const log = store.getState().actionLog

  expect(log).toHaveLength(1)
  expect(log[0].event).toEqual({
    actorId: 'a',
    gameTimeMs: 0,
    phase: 'intent',
    target: { x: 1, y: 1 },
  })
})

test('actionLog の gameTimeMs は tick の倍数になる決定論的な値', () => {
  const store = createActorStore()

  store.getState().setProgressMode('a', 'manual')
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 6, y: 0 } })
  store.getState().dispatchAction('a')
  store.getState().dispatchAction('a')
  store.getState().dispatchAction('a')

  const gameTimeMsList = store
    .getState()
    .actionLog.map((entry) => entry.event.gameTimeMs)

  expect(gameTimeMsList).toEqual([0, 200, 400, 600])
})

test('dispatchAction (manual) は1回の呼び出しで1tickだけ進む', () => {
  const store = createActorStore()

  store.getState().setProgressMode('a', 'manual')
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 6, y: 0 } })

  store.getState().dispatchAction('a')

  expect(store.getState().positionById.a).toEqual({ x: 2, y: 0 })
  expect(store.getState().movePathById.a).toHaveLength(2)
  const log = store.getState().actionLog
  expect(log[log.length - 1].event.phase).toBe('execution')

  store.getState().dispatchAction('a')
  store.getState().dispatchAction('a')

  expect(store.getState().positionById.a).toEqual({ x: 6, y: 0 })
  expect(store.getState().movePathById.a).toHaveLength(0)
  const finalLog = store.getState().actionLog
  expect(finalLog[finalLog.length - 1].event.phase).toBe('resolution')
})

test('dispatchAction (auto) はタイマーで最後まで自動進行する', () => {
  const store = createActorStore()

  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 6, y: 0 } })
  store.getState().dispatchAction('a')

  expect(store.getState().positionById.a).toEqual({ x: 2, y: 0 })

  vi.advanceTimersByTime(200)
  expect(store.getState().positionById.a).toEqual({ x: 4, y: 0 })

  vi.advanceTimersByTime(200)
  expect(store.getState().positionById.a).toEqual({ x: 6, y: 0 })
  expect(store.getState().movePathById.a).toHaveLength(0)
})

test('speed が高い actor は1tickあたりの移動距離が長くなる', () => {
  const store = createActorStore()

  store.setState({ speedById: { a: 0.02 } }) // tickMs=200 -> stepDistance=4 (デフォルトの2倍)
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 8, y: 0 } })

  expect(store.getState().movePathById.a).toHaveLength(2)
})

test('tickRate が高い actor は auto 進行の間隔が短くなる', () => {
  const store = createActorStore()

  // tickMs=400/4=100 (デフォルトの半分) -> stepDistance = 0.01 * 100 = 1
  store.setState({ tickRateById: { a: 4 } })
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 2, y: 0 } })
  store.getState().dispatchAction('a')

  expect(store.getState().positionById.a).toEqual({ x: 1, y: 0 })

  vi.advanceTimersByTime(100)
  expect(store.getState().positionById.a).toEqual({ x: 2, y: 0 })
})

test('minPathStepsById を指定すると短距離の企図でも経路が最低 step 数に分割される', () => {
  const store = createActorStore()

  store.setState({ minPathStepsById: { a: 3 } })
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 1, y: 0 } })

  expect(store.getState().movePathById.a).toHaveLength(3)
})

test('複数回の企図・行動決定をまたいでも gameTimeMs が衝突せず履歴が残り続ける', () => {
  const store = createActorStore()

  store.getState().setProgressMode('a', 'manual')

  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 2, y: 0 } })
  store.getState().dispatchAction('a')

  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 4, y: 0 } })
  store.getState().dispatchAction('a')

  const gameTimeMsList = store
    .getState()
    .actionLog.filter((entry) => entry.event.phase !== 'intent')
    .map((entry) => entry.event.gameTimeMs)

  // 1回目: 200ms, 2回目: 400ms (0からリセットされず続けて数える)
  expect(gameTimeMsList).toEqual([200, 400])
  expect(new Set(gameTimeMsList).size).toBe(gameTimeMsList.length)
})

test('複数 actor の移動は互いの position/log に影響しない', () => {
  const store = createActorStore()

  store.getState().setProgressMode('a', 'manual')
  store.getState().setProgressMode('b', 'manual')
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 2, y: 0 } })
  store.getState().dispatchMoveIntent({ actorId: 'b', target: { x: 0, y: 2 } })
  store.getState().dispatchAction('a')
  store.getState().dispatchAction('b')

  const state = store.getState()

  expect(state.positionById).toEqual({
    a: { x: 2, y: 0 },
    b: { x: 0, y: 2 },
  })
  expect(state.actionLog.map((entry) => entry.event.actorId)).toEqual([
    'a',
    'b',
    'a',
    'b',
  ])
})

test('reset で全 actor の状態が初期状態に戻る', () => {
  const store = createActorStore()

  store.getState().setProgressMode('a', 'manual')
  store.getState().dispatchMoveIntent({ actorId: 'a', target: { x: 2, y: 0 } })
  store.getState().dispatchAction('a')

  store.getState().reset()

  const state = store.getState()

  expect(state.positionById).toEqual({})
  expect(state.movePathById).toEqual({})
  expect(state.actionLog).toEqual([])
  expect(state.tickCountById).toEqual({})
  expect(state.progressModeById).toEqual({})
})
