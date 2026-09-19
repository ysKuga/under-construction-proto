import { expect, test } from 'vitest'

import { createItemStore } from '../_stores/items/store'
import { ItemInstance } from '../_stores/items/types'
import { OBSTACLE_CELLS } from '../constants'

import { getCellContents } from './get-cell-contents'

const RECOVERY_ITEM: ItemInstance = {
  amount: 3,
  cell: { col: 2, row: 0 },
  id: 'item-1',
  kind: 'energy-recovery',
}

test('障害物セルは obstacle を返す', () => {
  const store = createItemStore([])

  expect(getCellContents(OBSTACLE_CELLS[0], store.getState())).toEqual([
    { kind: 'obstacle' },
  ])
})

test('アイテムのあるセルは item を返す', () => {
  const store = createItemStore([RECOVERY_ITEM])

  expect(getCellContents({ col: 2, row: 0 }, store.getState())).toEqual([
    { item: RECOVERY_ITEM, kind: 'item' },
  ])
})

test('何もないセルは空配列を返す', () => {
  const store = createItemStore([])

  expect(getCellContents({ col: 3, row: 3 }, store.getState())).toEqual([])
})

test('消費済みアイテムは返さない', () => {
  const store = createItemStore([RECOVERY_ITEM])

  store.getState().consumeItem('item-1')

  expect(getCellContents({ col: 2, row: 0 }, store.getState())).toEqual([])
})
