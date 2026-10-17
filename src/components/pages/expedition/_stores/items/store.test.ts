import { expect, test } from 'vitest'

import { createItemStore } from './store'
import { ItemInstance } from './types'

const CHARGE_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 0, r: 1 },
  id: 'item-1',
  kind: 'energy-charge',
}

const CHARGE_SPOT: ItemInstance = {
  amount: 2,
  cell: { q: 0, r: 3 },
  id: 'spot-1',
  kind: 'energy-charge',
  stock: 2,
}

test('getItemAtCell で cell 上のアイテムを返す', () => {
  const store = createItemStore([CHARGE_ITEM])

  expect(store.getState().getItemAtCell({ q: 0, r: 1 })).toEqual(CHARGE_ITEM)
  expect(store.getState().getItemAtCell({ q: 0, r: 0 })).toBeUndefined()
})

test('consumeItem で stock 未指定のアイテムは削除される', () => {
  const store = createItemStore([CHARGE_ITEM])

  expect(store.getState().consumeItem('item-1')).toEqual(CHARGE_ITEM)
  expect(store.getState().getItemAtCell({ q: 0, r: 1 })).toBeUndefined()
  expect(store.getState().consumeItem('item-1')).toBeUndefined()
})

test('consumeItem で stock 指定のアイテムは1減り、0で枯渇する', () => {
  const store = createItemStore([CHARGE_SPOT])

  expect(store.getState().consumeItem('spot-1')).toEqual({
    ...CHARGE_SPOT,
    stock: 1,
  })
  expect(store.getState().getItemAtCell({ q: 0, r: 3 })).toEqual({
    ...CHARGE_SPOT,
    stock: 1,
  })

  expect(store.getState().consumeItem('spot-1')).toEqual({
    ...CHARGE_SPOT,
    stock: 0,
  })
  expect(store.getState().getItemAtCell({ q: 0, r: 3 })).toBeUndefined()
  expect(store.getState().consumeItem('spot-1')).toBeUndefined()
})

test('reset で初期状態に戻る', () => {
  const store = createItemStore([CHARGE_ITEM])

  store.getState().consumeItem('item-1')
  store.getState().reset()

  expect(store.getState().getItemAtCell({ q: 0, r: 1 })).toEqual(CHARGE_ITEM)
})
