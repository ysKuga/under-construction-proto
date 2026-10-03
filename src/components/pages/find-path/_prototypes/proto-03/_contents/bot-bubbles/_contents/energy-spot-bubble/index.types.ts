import { RefObject } from 'react'

import { EnergySpotBubbleHandle } from '../../../../_components/energy-spot-bubble'

export type UseEnergySpotBubbleContentReturn = {
  /** `EnergySpotBubble` の imperative API。揺れを ref 経由で命令する */
  bubbleRef: RefObject<EnergySpotBubbleHandle | null>
  /**
   * 吹き出しクリック時。現在セルの EN スポットを使用する
   *
   * - 拒否されたら吹き出しを揺らす（`FindPath-shake-bot-bubble`）
   */
  handleClick: () => Promise<void>
}
