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

test('setTickMs は tickMs を tickRate に変換して保持する (他フィールドは維持)', () => {
  const store = createActorStore()

  store.setState({ actorById: { a: { speed: 0.02, tickRate: 2 } } })
  store.getState().setTickMs('a', 100)

  expect(store.getState().actorById.a).toEqual({ speed: 0.02, tickRate: 4 })
})

test('setTickMs は未設定 actor に対してデフォルト値をベースに設定する', () => {
  const store = createActorStore()

  store.getState().setTickMs('a', 100)

  expect(store.getState().actorById.a).toEqual({ speed: 0.01, tickRate: 4 })
})
