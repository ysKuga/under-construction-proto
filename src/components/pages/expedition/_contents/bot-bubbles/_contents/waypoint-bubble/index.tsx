'use client'

import { WaypointBubble } from '../../../../_components/waypoint-bubble'

import { useWaypointBubbleContent } from './index.hooks'

/**
 * 中継点の吹き出し（issue #137/#226）
 *
 * - クリックで中継点選択モードを切り替える
 * - 選択中は背後の経路を隠さないよう半透明にする
 * - 位置・表示状態は `BubbleSlots` から `BotBubble.Provider` 経由で受け取る
 */
export const WaypointBubbleContent = () => {
  const { handleClick, waypointBubbleRef } = useWaypointBubbleContent()

  return <WaypointBubble onClick={handleClick} ref={waypointBubbleRef} />
}
