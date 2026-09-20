import { expect, test } from 'vitest'

import { ItemInstance } from '../items/types'

import { createCarriedItemStore } from './store'

const item = (id: string): ItemInstance => ({
  amount: 3,
  cell: { col: 2, row: 0 },
  id,
  kind: 'energy-recovery',
})

test('pickUp で携行し、上限未満なら true を返す', () => {
  const store = createCarriedItemStore(2)

  expect(store.getState().pickUp(item('a'))).toBe(true)
  expect(store.getState().carriedItems).toEqual([item('a')])
})

test('pickUp は上限に達すると false を返し、追加しない', () => {
  const store = createCarriedItemStore(1)

  expect(store.getState().pickUp(item('a'))).toBe(true)
  expect(store.getState().pickUp(item('b'))).toBe(false)
  expect(store.getState().carriedItems).toEqual([item('a')])
})

test('useItem は最古のものから取り出す（FIFO）', () => {
  const store = createCarriedItemStore(3)

  store.getState().pickUp(item('a'))
  store.getState().pickUp(item('b'))

  expect(store.getState().useItem()).toEqual(item('a'))
  expect(store.getState().carriedItems).toEqual([item('b')])
})

test('useItem は空なら undefined を返す', () => {
  const store = createCarriedItemStore(1)

  expect(store.getState().useItem()).toBeUndefined()
})

test('reset で初期状態に戻る', () => {
  const store = createCarriedItemStore(1)

  store.getState().pickUp(item('a'))
  store.getState().reset()

  expect(store.getState().carriedItems).toEqual([])
})
