'use client'

import { memo, useEffect, useRef } from 'react'

import { BotBubble, BotBubbleHandle } from '../bot-bubble'

type EnergySpotChargedBubbleProps = {
  /**
   * bot 基準点(0, 0)から見た表示位置(px)。`BotBubble` の `offset` 参照
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  offset?: { x: number; y: number }
  /**
   * 表示するか（EN スポットでの補給の完了後、一定時間または次の行為まで）
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  visible?: boolean
}

/**
 * EN スポットでの補給の完了を知らせる吹き出し（issue #297）
 *
 * - 表示専用。押せない
 * - 完了の発言として、常に発言吹き出しで表示する
 * - 見た目・表示切替は `BotBubble` に委ねる
 */
export const EnergySpotChargedBubble = memo(
  (props: EnergySpotChargedBubbleProps) => {
    const { offset, visible } = props

    const botBubbleRef = useRef<BotBubbleHandle>(null)

    useEffect(() => {
      // 完了の発言として、発言吹き出しへ切り替える
      botBubbleRef.current?.setSpeech(true)
    }, [])

    return (
      <BotBubble
        ariaLabel="EN スポットで補給完了"
        offset={offset}
        ref={botBubbleRef}
        speechText="補給完了！"
        thoughtText="補給完了！"
        visible={visible}
      />
    )
  },
)

EnergySpotChargedBubble.displayName = 'EnergySpotChargedBubble'
