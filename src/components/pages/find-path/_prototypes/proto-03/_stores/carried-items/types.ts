import { StoreApi } from 'zustand/vanilla'

import { ItemInstance } from '../items/types'

/**
 * 携行中アイテムを保持する store
 *
 * - 回復アイテム（`ItemInstance.stock` 未指定）専用。EN スポットは据置型の
 *   ため対象外（即時回復のまま）。proto-01 の同型を移植（issue #281）
 */
export type CarriedItemState = {
  /** 携行可能な上限数 */
  capacity: number
  /** 携行中アイテム一覧（拾った順、先頭が最古） */
  carriedItems: ItemInstance[]
  /**
   * アイテムを携行する
   *
   * - 上限に達している場合は何もせず `false` を返す（呼び出し元は
   *   `ItemStore.consumeItem` を呼ばず、アイテムをその場に残す）
   */
  pickUp: (item: ItemInstance) => boolean
  /** id の携行アイテムを取り出す（携行していなければ `undefined`） */
  removeItem: (id: string) => ItemInstance | undefined
  /** 初期状態に戻す */
  reset: () => void
}

export type CarriedItemStore = StoreApi<CarriedItemState>
