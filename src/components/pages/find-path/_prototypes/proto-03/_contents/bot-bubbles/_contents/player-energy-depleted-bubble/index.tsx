'use client'

import { createPortal } from 'react-dom'

import {
  ENERGY_DEPLETED_BUBBLE_OFFSET,
  EnergyDepletedBubble,
} from '../../../../_components/energy-depleted-bubble'

import { usePlayerEnergyDepletedBubble } from './index.hooks'

/**
 * player の EN 切れ吹き出し（issue #137/#281）
 *
 * - bot 頭上のオーバーレイコンテナへ注入する（`BubblePair` と同じ仕組み）
 * - EN 切れ中のみ表示する
 * - クリックで救済手段（手持ちのアイテム使用・チェックポイントへのリセット）を実行する
 * - `FindPath-shake-bot-bubble`（操作の拒否等）で揺れる
 */
export const PlayerEnergyDepletedBubble = () => {
  const {
    bubbleRef,
    handleRescueClick,
    overlayContainer,
    rescueItemKind,
    visible,
  } = usePlayerEnergyDepletedBubble()

  if (!overlayContainer) return null

  return createPortal(
    <EnergyDepletedBubble
      offset={ENERGY_DEPLETED_BUBBLE_OFFSET}
      onClick={handleRescueClick}
      ref={bubbleRef}
      rescueItemKind={rescueItemKind}
      visible={visible}
    />,
    overlayContainer,
  )
}
