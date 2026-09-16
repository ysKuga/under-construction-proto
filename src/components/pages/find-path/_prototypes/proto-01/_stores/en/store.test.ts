import { expect, test } from 'vitest'

import { DEFAULT_EN_INFO } from './constants'
import { createEnStore } from './store'

const ACTOR_ID = 'actor-1'

test('未設定 actor はデフォルト値を返す', () => {
  const store = createEnStore()

  expect(store.getState().getEnInfo(ACTOR_ID)).toEqual(DEFAULT_EN_INFO)
})

test('consume で current が減る', () => {
  const store = createEnStore()

  store.getState().consume(ACTOR_ID, 3)

  expect(store.getState().getEnInfo(ACTOR_ID)).toEqual({
    ...DEFAULT_EN_INFO,
    current: DEFAULT_EN_INFO.current - 3,
  })
})

test('consume は current を 0 未満にしない', () => {
  const store = createEnStore()

  store.getState().consume(ACTOR_ID, DEFAULT_EN_INFO.current + 5)

  expect(store.getState().getEnInfo(ACTOR_ID).current).toBe(0)
})

test('reset で初期状態に戻る', () => {
  const store = createEnStore()

  store.getState().consume(ACTOR_ID, 3)
  store.getState().reset()

  expect(store.getState().getEnInfo(ACTOR_ID)).toEqual(DEFAULT_EN_INFO)
})
