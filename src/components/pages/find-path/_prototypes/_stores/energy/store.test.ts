import { expect, test } from 'vitest'

import { DEFAULT_ENERGY_INFO } from './constants'
import { createEnergyStore } from './store'

const ACTOR_ID = 'actor-1'

test('未設定 actor はデフォルト値を返す', () => {
  const store = createEnergyStore()

  expect(store.getState().getEnergyInfo(ACTOR_ID)).toEqual(DEFAULT_ENERGY_INFO)
})

test('consume で current が減る', () => {
  const store = createEnergyStore()

  store.getState().consume(ACTOR_ID, 3)

  expect(store.getState().getEnergyInfo(ACTOR_ID)).toEqual({
    ...DEFAULT_ENERGY_INFO,
    current: DEFAULT_ENERGY_INFO.current - 3,
  })
})

test('consume は current を 0 未満にしない', () => {
  const store = createEnergyStore()

  store.getState().consume(ACTOR_ID, DEFAULT_ENERGY_INFO.current + 5)

  expect(store.getState().getEnergyInfo(ACTOR_ID).current).toBe(0)
})

test('recover で current が増える', () => {
  const store = createEnergyStore()

  store.getState().consume(ACTOR_ID, 5)
  store.getState().recover(ACTOR_ID, 2)

  expect(store.getState().getEnergyInfo(ACTOR_ID)).toEqual({
    ...DEFAULT_ENERGY_INFO,
    current: DEFAULT_ENERGY_INFO.current - 5 + 2,
  })
})

test('recover は current を max より増やさない', () => {
  const store = createEnergyStore()

  store.getState().consume(ACTOR_ID, 1)
  store.getState().recover(ACTOR_ID, 100)

  expect(store.getState().getEnergyInfo(ACTOR_ID).current).toBe(
    DEFAULT_ENERGY_INFO.max,
  )
})

test('reset で初期状態に戻る', () => {
  const store = createEnergyStore()

  store.getState().consume(ACTOR_ID, 3)
  store.getState().reset()

  expect(store.getState().getEnergyInfo(ACTOR_ID)).toEqual(DEFAULT_ENERGY_INFO)
})
