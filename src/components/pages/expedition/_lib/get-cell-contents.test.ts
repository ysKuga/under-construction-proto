import { expect, test } from 'vitest'

import { DEFAULT_STAGE_LAYOUT } from '../_contexts/stage-layout/constants'
import { createItemStore } from '../_stores/items/store'
import { ItemInstance } from '../_stores/items/types'

import { getCellContents } from './get-cell-contents'

const CHARGE_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 0, r: 1 },
  id: 'item-1',
  kind: 'energy-charge',
}

test('障害物セルは obstacle を返す', () => {
  const store = createItemStore([])

  expect(
    getCellContents(
      DEFAULT_STAGE_LAYOUT.obstacles[0],
      store.getState(),
      DEFAULT_STAGE_LAYOUT,
    ),
  ).toEqual([{ kind: 'obstacle' }])
})

test('アイテムのあるセルは item を返す', () => {
  const store = createItemStore([CHARGE_ITEM])

  expect(
    getCellContents({ q: 0, r: 1 }, store.getState(), DEFAULT_STAGE_LAYOUT),
  ).toEqual([{ item: CHARGE_ITEM, kind: 'item' }])
})

test('何もないセルは空配列を返す', () => {
  const store = createItemStore([])

  expect(
    getCellContents({ q: 4, r: 4 }, store.getState(), DEFAULT_STAGE_LAYOUT),
  ).toEqual([])
})

test('消費済みアイテムは返さない', () => {
  const store = createItemStore([CHARGE_ITEM])

  store.getState().consumeItem('item-1')

  expect(
    getCellContents({ q: 0, r: 1 }, store.getState(), DEFAULT_STAGE_LAYOUT),
  ).toEqual([])
})
