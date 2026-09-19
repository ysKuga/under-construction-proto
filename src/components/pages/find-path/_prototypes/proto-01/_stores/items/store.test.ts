import { expect, test } from 'vitest'

import { createItemStore } from './store'
import { ItemInstance } from './types'

const RECOVERY_ITEM: ItemInstance = {
  amount: 3,
  cell: { col: 2, row: 0 },
  id: 'item-1',
  kind: 'energy-recovery',
}

const RECOVERY_SPOT: ItemInstance = {
  amount: 2,
  cell: { col: 4, row: 2 },
  id: 'spot-1',
  kind: 'energy-recovery',
  stock: 2,
}

test('getItemAtCell で cell 上のアイテムを返す', () => {
  const store = createItemStore([RECOVERY_ITEM])

  expect(store.getState().getItemAtCell({ col: 2, row: 0 })).toEqual(
    RECOVERY_ITEM,
  )
  expect(store.getState().getItemAtCell({ col: 0, row: 0 })).toBeUndefined()
})

test('consumeItem で stock 未指定のアイテムは削除される', () => {
  const store = createItemStore([RECOVERY_ITEM])

  expect(store.getState().consumeItem('item-1')).toEqual(RECOVERY_ITEM)
  expect(store.getState().getItemAtCell({ col: 2, row: 0 })).toBeUndefined()
  expect(store.getState().consumeItem('item-1')).toBeUndefined()
})

test('consumeItem で stock 指定のアイテムは1減り、0で枯渇する', () => {
  const store = createItemStore([RECOVERY_SPOT])

  expect(store.getState().consumeItem('spot-1')).toEqual({
    ...RECOVERY_SPOT,
    stock: 1,
  })
  expect(store.getState().getItemAtCell({ col: 4, row: 2 })).toEqual({
    ...RECOVERY_SPOT,
    stock: 1,
  })

  expect(store.getState().consumeItem('spot-1')).toEqual({
    ...RECOVERY_SPOT,
    stock: 0,
  })
  expect(store.getState().getItemAtCell({ col: 4, row: 2 })).toBeUndefined()
  expect(store.getState().consumeItem('spot-1')).toBeUndefined()
})

test('reset で初期状態に戻る', () => {
  const store = createItemStore([RECOVERY_ITEM])

  store.getState().consumeItem('item-1')
  store.getState().reset()

  expect(store.getState().getItemAtCell({ col: 2, row: 0 })).toEqual(
    RECOVERY_ITEM,
  )
})
