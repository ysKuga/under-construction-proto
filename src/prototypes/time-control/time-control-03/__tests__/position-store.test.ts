import { createActorSettingsStore } from '../_stores/actor-settings-store'
import { createActorStore } from '../_stores/actor-store'
import { createGameClockStore } from '../_stores/game-clock-store'
import { createPathStore } from '../_stores/path-store'
import { createPositionStore } from '../_stores/position-store'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

const setup = () => {
  const actorStore = createActorStore()
  const actorSettingsStore = createActorSettingsStore()
  const pathStore = createPathStore()
  const gameClockStore = createGameClockStore()
  const positionStore = createPositionStore(
    actorStore,
    actorSettingsStore,
    pathStore,
    gameClockStore,
  )

  return {
    actorSettingsStore,
    actorStore,
    gameClockStore,
    pathStore,
    positionStore,
  }
}

test('未移動 actor の position は保持されない', () => {
  const { positionStore } = setup()

  expect(positionStore.getState().positionById.a).toBeUndefined()
})

test('dispatchAction (manual) は1回の呼び出しで1tickだけ進み、経路を消費する', () => {
  const { actorSettingsStore, gameClockStore, pathStore, positionStore } =
    setup()

  actorSettingsStore.getState().setProgressMode('a', 'manual')
  pathStore.getState().setPath('a', [
    { x: 2, y: 0 },
    { x: 4, y: 0 },
    { x: 6, y: 0 },
  ])

  positionStore.getState().dispatchAction('a')

  expect(positionStore.getState().positionById.a).toEqual({ x: 2, y: 0 })
  expect(pathStore.getState().pathById.a).toHaveLength(2)
  expect(gameClockStore.getState().eventLog).toHaveLength(1)
  expect(gameClockStore.getState().eventLog[0].event.phase).toBe('execution')

  positionStore.getState().dispatchAction('a')
  positionStore.getState().dispatchAction('a')

  expect(positionStore.getState().positionById.a).toEqual({ x: 6, y: 0 })
  expect(pathStore.getState().pathById.a).toHaveLength(0)
  const log = gameClockStore.getState().eventLog
  expect(log[log.length - 1].event.phase).toBe('resolution')
})

test('dispatchAction (auto) はタイマーで最後まで自動進行する', () => {
  const { actorStore, pathStore, positionStore } = setup()

  actorStore.getState().reset()
  actorStore.setState({ actorById: { a: { speed: 0.01, tickRate: 2 } } })
  pathStore.getState().setPath('a', [
    { x: 2, y: 0 },
    { x: 4, y: 0 },
  ])

  positionStore.getState().dispatchAction('a')

  expect(positionStore.getState().positionById.a).toEqual({ x: 2, y: 0 })

  vi.advanceTimersByTime(200)
  expect(positionStore.getState().positionById.a).toEqual({ x: 4, y: 0 })
  expect(pathStore.getState().pathById.a).toHaveLength(0)
})

test('reset で position のみ初期状態に戻る (他 store は対象外)', () => {
  const { pathStore, positionStore } = setup()

  pathStore.getState().setPath('a', [{ x: 2, y: 0 }])
  positionStore.getState().dispatchAction('a')
  positionStore.getState().reset()

  expect(positionStore.getState().positionById).toEqual({})
})
