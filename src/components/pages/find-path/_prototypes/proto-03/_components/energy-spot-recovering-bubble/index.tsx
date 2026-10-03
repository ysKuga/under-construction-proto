'use client'

import { memo } from 'react'

import { BotBubble } from '../bot-bubble'

type EnergySpotRecoveringBubbleProps = {
  /**
   * bot 基準点(0, 0)から見た表示位置(px)。`BotBubble` の `offset` 参照
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  offset?: { x: number; y: number }
  /**
   * 表示するか（EN スポットで回復中）
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  visible?: boolean
}

/**
 * EN スポットで回復中であることを示す吹き出し（issue #297）
 *
 * - 表示専用。押せない（回復は中断しないため操作を持たない）
 * - 見た目・表示切替は `BotBubble` に委ねる
 */
export const EnergySpotRecoveringBubble = memo(
  (props: EnergySpotRecoveringBubbleProps) => {
    const { offset, visible } = props

    return (
      <BotBubble
        ariaLabel="EN スポットで補給中"
        offset={offset}
        speechText="補給中…"
        thoughtText="補給中…"
        visible={visible}
      />
    )
  },
)

EnergySpotRecoveringBubble.displayName = 'EnergySpotRecoveringBubble'
