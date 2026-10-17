import { StoreApi } from 'zustand/vanilla'

import { ItemInstance } from '../items/types'

/**
 * 携行中アイテムを保持する store
 *
 * - EN 補給アイテム（`ItemInstance.stock` 未指定）専用。EN スポットは据置型の
 *   ため対象外（即時補給のまま、issue #181）
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
  /** 初期状態に戻す */
  reset: () => void
  /** 最古の携行アイテムを1つ取り出す（空なら `undefined`） */
  useItem: () => ItemInstance | undefined
}

export type CarriedItemStore = StoreApi<CarriedItemState>
