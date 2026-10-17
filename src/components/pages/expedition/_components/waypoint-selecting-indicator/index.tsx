'use client'

import { memo, useEffect } from 'react'

import { useCssToggle } from '@/hooks/use-css-toggle'

type WaypointSelectingIndicatorProps = {
  /** 「完了」クリック時。中継点選択モードを終了する */
  onDoneClick: () => void
  /** 表示するか（`waypointFlowState === 'selecting'`） */
  visible: boolean
}

/**
 * 中継点選択モード中であることを示すインジケータ + 選択モードを終了する「完了」ボタン
 *
 * - 操作パネル（通常の 2D DOM）に置く想定。`WaypointSelectLayer`（`Stage07` の
 *   3D 空間内）とは異なる親配下のため、vanilla-extract の兄弟セレクター(`~`)を
 *   共有できず、`selecting` 用に独立した `useCssToggle` インスタンスを持つ
 *   （`WaypointBubble`/`WaypointSelectLayer` と同型のパターン）
 * - 表示/非表示は `useCssToggle` で自己管理する。`visible` prop の変化を
 *   hidden checkbox の checked へ同期するだけで、React state による条件付き
 *   レンダリングは行わない
 */
export const WaypointSelectingIndicator = memo(
  (props: WaypointSelectingIndicatorProps) => {
    const { onDoneClick, visible } = props

    const { checkbox, set: setToggled, toggledClassName } = useCssToggle()

    useEffect(() => {
      setToggled(visible)
    }, [setToggled, visible])

    return (
      <>
        {checkbox}
        <span className={toggledClassName}>
          🧭 中継点選択中(クリックで設置/除去)
        </span>
        <button
          className={toggledClassName}
          onClick={onDoneClick}
          type="button"
        >
          ✅ 完了
        </button>
      </>
    )
  },
)

WaypointSelectingIndicator.displayName = 'WaypointSelectingIndicator'
