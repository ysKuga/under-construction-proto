import { expect, test } from 'vitest'

import { ItemInstance } from '../items/types'

import { createCarriedItemStore } from './store'

const item = (id: string): ItemInstance => ({
  amount: 3,
  cell: { q: 1, r: 1 },
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

test('removeItem は id の携行アイテムを取り出す', () => {
  const store = createCarriedItemStore(3)

  store.getState().pickUp(item('a'))
  store.getState().pickUp(item('b'))

  expect(store.getState().removeItem('b')).toEqual(item('b'))
  expect(store.getState().carriedItems).toEqual([item('a')])
})

test('removeItem は携行していない id なら undefined を返す', () => {
  const store = createCarriedItemStore(1)

  expect(store.getState().removeItem('a')).toBeUndefined()
})

test('reset で初期状態に戻る', () => {
  const store = createCarriedItemStore(1)

  store.getState().pickUp(item('a'))
  store.getState().reset()

  expect(store.getState().carriedItems).toEqual([])
})
