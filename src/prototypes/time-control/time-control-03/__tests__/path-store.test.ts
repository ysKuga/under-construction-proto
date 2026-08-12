import { createPathStore } from '../_stores/path'

test('未設定 actor の経路は空扱い', () => {
  const store = createPathStore()

  expect(store.getState().pathById.a).toBeUndefined()
})

test('setPath は対象 actor の経路のみ置き換える', () => {
  const store = createPathStore()

  store.getState().setPath('a', [{ x: 1, y: 0 }])
  store.getState().setPath('b', [{ x: 0, y: 1 }])

  expect(store.getState().pathById).toEqual({
    a: [{ x: 1, y: 0 }],
    b: [{ x: 0, y: 1 }],
  })
})

test('reset で全 actor の経路が初期状態に戻る', () => {
  const store = createPathStore()

  store.getState().setPath('a', [{ x: 1, y: 0 }])
  store.getState().reset()

  expect(store.getState().pathById).toEqual({})
})
