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
 * `EnergySpotBubble` が呼び出し元へ公開する imperative API
 *
 * - `EnergyDepletedBubbleHandle` と同じく props でなく ref 経由の命令で伝える
 */
export type EnergySpotBubbleHandle = {
  /** 左右に小刻みに揺らす（`BotBubbleHandle.shake`） */
  shake: () => void
}

type EnergySpotBubbleProps = {
  /**
   * bot 基準点(0, 0)から見た表示位置(px)。`BotBubble` の `offset` 参照
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  offset?: { x: number; y: number }
  /** クリック時。EN スポットを使用して補給する */
  onClick: () => void
  /**
   * 表示するか（EN スポット上で停止中、かつ補給できる）
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  visible?: boolean
}

/**
 * 現在セルの EN スポットを使用する吹き出し（issue #297）
 *
 * - 見た目・表示切替は `BotBubble` に委ねる
 * - 文言は hover 中のみ発言吹き出し「補給！」、それ以外は思考吹き出し「補給？」
 * - 拒否された操作を知らせるために揺らす（`EnergySpotBubbleHandle.shake`）
 */
export const EnergySpotBubble = memo(
  forwardRef(
    (
      props: EnergySpotBubbleProps,
      ref: ForwardedRef<EnergySpotBubbleHandle>,
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
          ariaLabel="EN スポットを使用して補給"
          offset={offset}
          onClick={onClick}
          ref={botBubbleRef}
          speechText="補給！"
          thoughtText="補給？"
          visible={visible}
        />
      )
    },
  ),
)

EnergySpotBubble.displayName = 'EnergySpotBubble'
