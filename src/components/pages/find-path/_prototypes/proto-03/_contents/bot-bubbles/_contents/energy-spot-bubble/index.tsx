'use client'

import { EnergySpotBubble } from '../../../../_components/energy-spot-bubble'

import { useEnergySpotBubbleContent } from './index.hooks'

/**
 * player の EN スポット吹き出し（issue #297）
 *
 * - クリックで現在セルの EN スポットを使用し、時間経過とともに補給する
 * - `FindPath-shake-bot-bubble`（操作の拒否等）で揺れる
 * - 位置・表示状態は `BubbleSlots` から `BotBubble.Provider` 経由で受け取る
 */
export const EnergySpotBubbleContent = () => {
  const { bubbleRef, handleClick } = useEnergySpotBubbleContent()

  return <EnergySpotBubble onClick={handleClick} ref={bubbleRef} />
}
