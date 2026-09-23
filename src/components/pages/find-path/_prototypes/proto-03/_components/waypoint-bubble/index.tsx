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
 * - `Stage07` の `ActorOverlayLayer` が用意するコンテナ原点
 *   (bot の位置決め div の画面上の左上)からの相対位置。呼び出し元がそのまま使うことを想定
 *   するが、`offset` prop 自体は任意の値を受け付ける
 */
export const WAYPOINT_BUBBLE_OFFSET = { x: 24, y: -36 }

/**
 * `WaypointBubble` が呼び出し元へ公開する imperative API
 *
 * - `selectable`(中継点選択モードが選択可能な状態か)を props でなく ref 経由の
 *   命令で伝える（`BotBubbleHandle` と同じ理由）
 */
export type WaypointBubbleHandle = {
  /** 思考吹き出し(文言「中継点？」)⇔発言吹き出し(文言「中継点！」)を切替える */
  setSelectable: (next: boolean) => void
}

type WaypointBubbleProps = {
  /** bot 基準点(0, 0)から見た表示位置(px)。`BotBubble` の `offset` 参照 */
  offset: { x: number; y: number }
  /**
   * クリック時。中継点選択モードへ移行する
   */
  onClick: () => void
  /** 表示するか（`waypointFlowState !== 'idle'`） */
  visible: boolean
}

/**
 * 中継点選択モードへの導線となる吹き出し
 *
 * - 見た目・表示切替は `BotBubble` に委ねる
 * - `selectable`（中継点選択モードが選択可能な状態か）で思考吹き出し
 *   「中継点？」⇔発言吹き出し「中継点！」を切替える
 *   （`WaypointBubbleHandle.setSelectable`）
 * - bot を挟んだ反対側に `ExecuteBubble`（「実行」）が並ぶ想定（issue #226）
 */
export const WaypointBubble = memo(
  forwardRef(
    (props: WaypointBubbleProps, ref: ForwardedRef<WaypointBubbleHandle>) => {
      const { offset, onClick, visible } = props

      const botBubbleRef = useRef<BotBubbleHandle>(null)

      useImperativeHandle(
        ref,
        () => ({
          setSelectable: (next) => botBubbleRef.current?.setSpeech(next),
        }),
        [],
      )

      return (
        <BotBubble
          ariaLabel="中継点選択モードへ移行"
          offset={offset}
          onClick={onClick}
          ref={botBubbleRef}
          speechText="中継点！"
          thoughtText="中継点？"
          visible={visible}
        />
      )
    },
  ),
)

WaypointBubble.displayName = 'WaypointBubble'
