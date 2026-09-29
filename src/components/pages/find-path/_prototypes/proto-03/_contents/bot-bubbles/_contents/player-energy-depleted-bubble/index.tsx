'use client'

import { createPortal } from 'react-dom'

import {
  ENERGY_DEPLETED_BUBBLE_OFFSET,
  EnergyDepletedBubble,
} from '../../../../_components/energy-depleted-bubble'

import { usePlayerEnergyDepletedBubble } from './index.hooks'

/**
 * player の EN 切れ吹き出し（issue #137）
 *
 * - bot 頭上のオーバーレイコンテナへ注入する（`BubblePair` と同じ仕組み）
 * - EN 切れ中のみ表示する
 * - `FindPath-shake-bot-bubble`（操作の拒否等）・自身のクリックで揺れる
 */
export const PlayerEnergyDepletedBubble = () => {
  const { bubbleRef, overlayContainer, shake, visible } =
    usePlayerEnergyDepletedBubble()

  if (!overlayContainer) return null

  return createPortal(
    <EnergyDepletedBubble
      offset={ENERGY_DEPLETED_BUBBLE_OFFSET}
      onClick={shake}
      ref={bubbleRef}
      visible={visible}
    />,
    overlayContainer,
  )
}
