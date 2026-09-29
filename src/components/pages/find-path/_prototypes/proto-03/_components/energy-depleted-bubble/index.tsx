'use client'

import {
  ForwardedRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from 'react'

import { BotBubble, BotBubbleHandle } from '../bot-bubble'

/**
 * bot 基準点(0, 0)から見た推奨表示位置(px)
 *
 * - `WaypointBubble` と同じ bot 右上。EN 切れ時は目標設定がキャンセルされ、
 *   中継点・実行の吹き出しと同時には表示されないため重ならない
 */
export const ENERGY_DEPLETED_BUBBLE_OFFSET = { x: 24, y: -36 }

/**
 * `EnergyDepletedBubble` が呼び出し元へ公開する imperative API
 *
 * - `WaypointBubbleHandle` と同じく props でなく ref 経由の命令で伝える
 */
export type EnergyDepletedBubbleHandle = {
  /** 左右に小刻みに揺らす（`BotBubbleHandle.shake`） */
  shake: () => void
}

type EnergyDepletedBubbleProps = {
  /** bot 基準点(0, 0)から見た表示位置(px)。`BotBubble` の `offset` 参照 */
  offset: { x: number; y: number }
  /** クリック時 */
  onClick: () => void
  /** 表示するか（EN 切れ中） */
  visible: boolean
}

/**
 * EN 切れで動けないことを伝える吹き出し（issue #137）
 *
 * - 見た目・表示切替は `BotBubble` に委ねる
 * - 文言は思考吹き出し「EN 切れ…」、hover 中は発言吹き出し「EN 切れ！」
 * - 拒否された操作を知らせるために揺らす（`EnergyDepletedBubbleHandle.shake`）
 */
export const EnergyDepletedBubble = memo(
  forwardRef(
    (
      props: EnergyDepletedBubbleProps,
      ref: ForwardedRef<EnergyDepletedBubbleHandle>,
    ) => {
      const { offset, onClick, visible } = props

      const botBubbleRef = useRef<BotBubbleHandle>(null)

      useImperativeHandle(
        ref,
        () => ({
          shake: () => botBubbleRef.current?.shake(),
        }),
        [],
      )

      return (
        <BotBubble
          ariaLabel="EN 切れ"
          offset={offset}
          onClick={onClick}
          ref={botBubbleRef}
          speechText="EN 切れ！"
          thoughtText="EN 切れ…"
          visible={visible}
        />
      )
    },
  ),
)

EnergyDepletedBubble.displayName = 'EnergyDepletedBubble'
