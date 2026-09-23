'use client'

import { memo } from 'react'

import { BotBubble } from '../bot-bubble'

/**
 * bot 基準点(0, 0)から見た推奨表示位置(px)
 *
 * - `placement: 'left'` のため本体の右端をこの位置へ合わせる
 * - `WAYPOINT_BUBBLE_OFFSET`(本体の左端 x=24)と 4px 空ける。bot(56px 四方、
 *   中心 x=28)基準の厳密な左右対称(x=32)だと両者が重なるため
 */
export const EXECUTE_BUBBLE_OFFSET = { x: 20, y: -36 }

type ExecuteBubbleProps = {
  /** bot 基準点(0, 0)から見た表示位置(px)。`BotBubble` の `offset` 参照 */
  offset: { x: number; y: number }
  /** クリック時。経路に沿った自動移動を開始する */
  onClick: () => void
  /** 表示するか（`waypointFlowState !== 'idle'`） */
  visible: boolean
}

/**
 * 経路に沿った自動移動を開始する「実行」吹き出し
 *
 * - bot を挟んで `WaypointBubble` の反対側(左)に置く（issue #226）。
 *   見た目・表示切替は `BotBubble` に委ねる
 * - 文言は hover 中のみ発言吹き出し「実行！」、それ以外は思考吹き出し「実行？」
 *   （`speechOnHover`、CSS のみで切替）
 * - 中継点の設置途中(`WaypointBubble` の `selectable` 選択時)でも押せ、
 *   表示中の経路で自動移動を開始する
 */
export const ExecuteBubble = memo((props: ExecuteBubbleProps) => {
  const { offset, onClick, visible } = props

  return (
    <BotBubble
      ariaLabel="経路に沿って自動移動を開始"
      offset={offset}
      onClick={onClick}
      placement="left"
      speechOnHover
      speechText="実行！"
      thoughtText="実行？"
      visible={visible}
    />
  )
})

ExecuteBubble.displayName = 'ExecuteBubble'
