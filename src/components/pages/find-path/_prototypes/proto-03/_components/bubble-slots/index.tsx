'use client'

import { PropsWithChildren } from 'react'

import { BotBubble } from '../bot-bubble'

import { resolveVisibility } from './_lib/resolve-visibility'
import { useBubbleSlotsStore } from './_stores/bubble-slots'

/** 吹き出しの表示位置の名前。bot に対する上・中・下と左右の組 */
type BubblePosition =
  | 'bottom-left'
  | 'bottom-right'
  | 'middle-left'
  | 'middle-right'
  | 'top-left'
  | 'top-right'

type BubbleSlotsProps = PropsWithChildren

/**
 * 表示位置ごとの `BotBubble` の位置指定
 *
 * - `offset` は children(bot)の左上を原点とした相対位置(px)
 * - `placement` は bot に対して本体を置く側。`-left` は本体の右端を `offset` へ合わせる
 * - `top-right` は本体の左端を x=24 へ置く
 * - `top-left` は本体の右端を x=20 へ置き、`top-right` と 4px 空ける。
 *   bot(56px 四方、中心 x=28)基準の厳密な左右対称(x=32)だと両者が重なるため
 * - `middle-*`・`bottom-*` は仮の値（未調整）
 */
const BUBBLE_POSITIONS = {
  'bottom-left': { offset: { x: 20, y: 64 }, placement: 'left' },
  'bottom-right': { offset: { x: 24, y: 64 }, placement: 'right' },
  'middle-left': { offset: { x: -4, y: 17 }, placement: 'left' },
  'middle-right': { offset: { x: 60, y: 17 }, placement: 'right' },
  'top-left': { offset: { x: 20, y: -36 }, placement: 'left' },
  'top-right': { offset: { x: 24, y: -36 }, placement: 'right' },
} as const satisfies Record<
  BubblePosition,
  { offset: { x: number; y: number }; placement: 'left' | 'right' }
>

/** 吹き出しを置く位置の並び。store の `bubbles` の先頭から順に割り当てる */
const SLOT_POSITIONS: readonly BubblePosition[] = ['top-right', 'top-left']

/** 仮の操作。吹き出しの操作は未接続 */
const noop = () => {}

/**
 * 吹き出しを一元的に格納するスロット
 *
 * - children(bot)の左上を原点に、格納した吹き出しを配列の順に位置へ置く
 *   - 位置は `BotBubble.Provider` 経由で各吹き出しの props の既定値として渡す
 * - 格納する吹き出しと表示制御状態は `BubbleSlotsStoreProvider` の store から受け取る
 * - 表示中の吹き出しの `hides` に含まれる種類(`kinds`)の吹き出しは非表示にする
 */
export const BubbleSlots = (props: BubbleSlotsProps) => {
  const { children } = props

  const bubbles = useBubbleSlotsStore((state) => state.bubbles)
  const visibility = useBubbleSlotsStore((state) => state.visibility)
  /** 種類による排他を適用した、吹き出しごとの表示状態 */
  const resolvedVisibility = resolveVisibility(bubbles, visibility)

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      {children}
      {bubbles.map(({ Bubble, id }, index) => (
        <BotBubble.Provider
          key={id}
          {...BUBBLE_POSITIONS[SLOT_POSITIONS[index]]}
        >
          <Bubble
            onClick={noop}
            onClose={noop}
            visible={resolvedVisibility[id]}
          />
        </BotBubble.Provider>
      ))}
    </div>
  )
}
