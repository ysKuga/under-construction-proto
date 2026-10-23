'use client'

import { createPortal } from 'react-dom'

import { useActorsStore } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'
import { Actor } from '@/types/theater/actor'

import { BubbleSlots } from '@/components/theater/aside/bubble-slots'
import { BubbleSlotsStoreProvider } from '@/components/theater/aside/bubble-slots/_stores/bubble-slots'
import { BubbleSlotEntry } from '@/components/theater/aside/bubble-slots/_stores/bubble-slots/types'

type OverlayBubbleSlotsProps = {
  /** 格納する吹き出し */
  initialBubbles: BubbleSlotEntry[]
  /**
   * 注入先オーバーレイコンテナの id（actors store の `overlayContainers` のキー）
   *
   * - bot 頭上なら `PLAYER_ACTOR_ID`、目標セル上なら `OBJECTIVE_OVERLAY_ID`
   */
  overlayId: Actor['id']
}

/**
 * オーバーレイコンテナへ吹き出しのスロットを注入する
 *
 * - オーバーレイコンテナ（floor の 3D 空間外、アンカーの画面上の位置へ追従）へ
 *   `createPortal` で注入する。3D 空間外のため `GeoLayer` セルと重なってもクリックを奪われない
 */
export const OverlayBubbleSlots = (props: OverlayBubbleSlotsProps) => {
  const { initialBubbles, overlayId } = props

  const overlayContainer = useActorsStore(
    (state) => state.overlayContainers[overlayId],
  )

  if (!overlayContainer) return null

  return createPortal(
    <BubbleSlotsStoreProvider initialBubbles={initialBubbles}>
      <BubbleSlots />
    </BubbleSlotsStoreProvider>,
    overlayContainer,
  )
}
