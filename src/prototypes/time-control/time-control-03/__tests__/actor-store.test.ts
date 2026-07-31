import { createActorStore } from '../_stores/actor-store'

test('未設定 actor の情報はデフォルト値', () => {
  const store = createActorStore()

  expect(store.getState().actorById.a).toBeUndefined()
})

test('reset で全 actor の情報が初期状態に戻る', () => {
  const store = createActorStore()

  store.setState({ actorById: { a: { speed: 0.02, tickRate: 4 } } })
  store.getState().reset()

  expect(store.getState().actorById).toEqual({})
})
