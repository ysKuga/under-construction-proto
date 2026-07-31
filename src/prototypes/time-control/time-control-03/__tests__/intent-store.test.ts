import { createActorSettingsStore } from '../_stores/actor-settings-store'
import { createActorStore } from '../_stores/actor-store'
import { createGameClockStore } from '../_stores/game-clock-store'
import { createIntentStore } from '../_stores/intent-store'
import { createPathStore } from '../_stores/path-store'
import { createPositionStore } from '../_stores/position-store'

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
  const intentStore = createIntentStore(
    actorStore,
    actorSettingsStore,
    pathStore,
    positionStore,
    gameClockStore,
  )

  return {
    actorSettingsStore,
    actorStore,
    gameClockStore,
    intentStore,
    pathStore,
    positionStore,
  }
}

test('dispatchMoveIntent は position を変更せず経路のみ生成する', () => {
  const { intentStore, pathStore, positionStore } = setup()

  intentStore
    .getState()
    .dispatchMoveIntent({ actorId: 'a', target: { x: 6, y: 0 } })

  expect(positionStore.getState().positionById.a).toBeUndefined()
  expect(pathStore.getState().pathById.a).toHaveLength(3)
})

test('dispatchMoveIntent は gameClockStore に intent のみ記録し、クロックを進めない', () => {
  const { gameClockStore, intentStore } = setup()

  intentStore
    .getState()
    .dispatchMoveIntent({ actorId: 'a', target: { x: 1, y: 1 } })

  const log = gameClockStore.getState().eventLog

  expect(log).toHaveLength(1)
  expect(log[0].event).toEqual({
    actorId: 'a',
    gameTimeMs: 0,
    phase: 'intent',
    target: { x: 1, y: 1 },
  })
  expect(gameClockStore.getState().commonGameTimeMs).toBe(0)
})

test('speed が高い actor は1tickあたりの移動距離が長くなる', () => {
  const { actorStore, intentStore, pathStore } = setup()

  actorStore.setState({ actorById: { a: { speed: 0.02, tickRate: 2 } } }) // tickMs=200 -> stepDistance=4 (デフォルトの2倍)
  intentStore
    .getState()
    .dispatchMoveIntent({ actorId: 'a', target: { x: 8, y: 0 } })

  expect(pathStore.getState().pathById.a).toHaveLength(2)
})

test('isFixedPathSteps が false の場合、fixedPathSteps を指定しても無視され距離ベース計算になる', () => {
  const { actorSettingsStore, intentStore, pathStore } = setup()

  actorSettingsStore.getState().setFixedPathSteps('a', 3)
  intentStore
    .getState()
    .dispatchMoveIntent({ actorId: 'a', target: { x: 1, y: 0 } })

  expect(pathStore.getState().pathById.a).toHaveLength(1)
})

test('isFixedPathSteps が true の場合、短距離の企図でも経路が fixedPathSteps に固定される', () => {
  const { actorSettingsStore, intentStore, pathStore } = setup()

  actorSettingsStore.getState().setFixedPathSteps('a', 3)
  actorSettingsStore.getState().setIsFixedPathSteps('a', true)
  intentStore
    .getState()
    .dispatchMoveIntent({ actorId: 'a', target: { x: 1, y: 0 } })

  expect(pathStore.getState().pathById.a).toHaveLength(3)
})
