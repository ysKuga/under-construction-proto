'use client'

import { EnergyDepletedBubble } from '../../../../_components/energy-depleted-bubble'

import { useEnergyDepletedBubbleContent } from './index.hooks'

/**
 * player の EN 切れ吹き出し（issue #137/#281）
 *
 * - クリックで救済手段（手持ちのアイテム使用・チェックポイントへのリセット）を実行する
 * - `FindPath-shake-bot-bubble`（操作の拒否等）で揺れる
 * - 位置・表示状態は `BubbleSlots` から `BotBubble.Provider` 経由で受け取る
 */
export const EnergyDepletedBubbleContent = () => {
  const { bubbleRef, handleRescueClick, rescueItemKind } =
    useEnergyDepletedBubbleContent()

  return (
    <EnergyDepletedBubble
      onClick={handleRescueClick}
      ref={bubbleRef}
      rescueItemKind={rescueItemKind}
    />
  )
}
