import { createPlannedPathStore } from '../_stores/planned-path'

test('未設定 actor の予定経路は空扱い', () => {
  const store = createPlannedPathStore()

  expect(store.getState().plannedPathById.a).toBeUndefined()
})

test('setPlannedPath は対象 actor の予定経路のみ置き換える', () => {
  const store = createPlannedPathStore()

  store.getState().setPlannedPath('a', [{ x: 1, y: 0 }])
  store.getState().setPlannedPath('b', [{ x: 0, y: 1 }])

  expect(store.getState().plannedPathById).toEqual({
    a: [{ x: 1, y: 0 }],
    b: [{ x: 0, y: 1 }],
  })
})

test('getTargets は対象 actor 全員の予定経路の終点を返す', () => {
  const store = createPlannedPathStore()

  store.getState().setPlannedPath('a', [
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ])

  expect(store.getState().getTargets(['a', 'b'])).toEqual([
    { x: 2, y: 0 },
    { x: 0, y: 0 },
  ])
})

test('reset で全 actor の予定経路が初期状態に戻る', () => {
  const store = createPlannedPathStore()

  store.getState().setPlannedPath('a', [{ x: 1, y: 0 }])
  store.getState().reset()

  expect(store.getState().plannedPathById).toEqual({})
})
