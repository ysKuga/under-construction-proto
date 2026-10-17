'use client'

import {
  ForwardedRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from 'react'

import { getCarriedItemPresentation } from '../../_lib/item-presentation'
import { ItemKind } from '../../_stores/items/types'
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
  offset?: { x: number; y: number }
  /** クリック時。提示中の救済手段を実行する */
  onClick: () => void
  /**
   * 救済手段として使う手持ちのアイテムの種類
   *
   * - 未指定なら手持ちなしとし、チェックポイントへのリセットを提示する
   */
  rescueItemKind?: ItemKind
  /**
   * 表示するか（EN 切れ中）
   *
   * - 未指定なら `BotBubble.Provider` の既定値を使う
   */
  visible?: boolean
}

/**
 * EN 切れで動けないことを伝え、救済手段の入口となる吹き出し（issue #137/#281）
 *
 * - 見た目・表示切替は `BotBubble` に委ねる
 * - 通常時は思考吹き出し「EN 切れ…」で状態を示す
 * - hover 中は発言吹き出しで救済手段を 1 つ示し、クリックで実行する
 *   - 手持ちあり: アイテムのアイコン + 「使う！」
 *   - 手持ちなし: チェックポイントへ「戻る！」
 * - 拒否された操作を知らせるために揺らす（`EnergyDepletedBubbleHandle.shake`）
 */
export const EnergyDepletedBubble = memo(
  forwardRef(
    (
      props: EnergyDepletedBubbleProps,
      ref: ForwardedRef<EnergyDepletedBubbleHandle>,
    ) => {
      const { offset, onClick, rescueItemKind, visible } = props

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
          ariaLabel={
            rescueItemKind
              ? 'EN 切れ: 手持ちのアイテムを使う'
              : 'EN 切れ: チェックポイントへ戻る'
          }
          offset={offset}
          onClick={onClick}
          ref={botBubbleRef}
          speechText={
            rescueItemKind ? (
              <>{getCarriedItemPresentation(rescueItemKind).icon}使う！</>
            ) : (
              '戻る！'
            )
          }
          thoughtText="EN 切れ…"
          visible={visible}
        />
      )
    },
  ),
)

EnergyDepletedBubble.displayName = 'EnergyDepletedBubble'
