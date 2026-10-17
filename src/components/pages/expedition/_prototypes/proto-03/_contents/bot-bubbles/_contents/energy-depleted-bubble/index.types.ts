import { RefObject } from 'react'

import { EnergyDepletedBubbleHandle } from '../../../../_components/energy-depleted-bubble'
import { ItemKind } from '../../../../_stores/items/types'

export type UseEnergyDepletedBubbleContentReturn = {
  /** `EnergyDepletedBubble` の imperative API。揺れを ref 経由で命令する */
  bubbleRef: RefObject<EnergyDepletedBubbleHandle | null>
  /**
   * 吹き出しクリック時。提示中の救済手段を実行する
   *
   * - 拒否されたら吹き出しを揺らす（`FindPath-shake-bot-bubble`）
   */
  handleRescueClick: () => Promise<void>
  /**
   * 救済手段として使う手持ちのアイテムの種類
   *
   * - EN 補給を許可された携行アイテムのうち最古のもの。なければ `undefined`\
   *   （チェックポイントへのリセットを提示する）
   */
  rescueItemKind?: ItemKind
}
