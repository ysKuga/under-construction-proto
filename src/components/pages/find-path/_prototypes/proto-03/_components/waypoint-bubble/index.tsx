'use client'

import { CSSProperties, memo, useEffect } from 'react'

import { useCssToggle } from '@/hooks/use-css-toggle'

/**
 * bot 頭上へ重なる推奨相対位置クラス
 *
 * - `Stage07` の `registerPlayerOverlayContainer` が用意するコンテナは bot の
 *   位置決め div（`botSize` 四方）内にあるため、その基準で bot 頭上に来る
 *   オフセットを決め打ちしている。呼び出し元がそのまま使うことを想定するが、
 *   `className` prop 自体は任意の値を受け付ける
 */
export const WAYPOINT_BUBBLE_POSITION_CLASS_NAME = '-top-9 left-10'

type WaypointBubbleProps = {
  /**
   * 表示位置を決める class 指定
   *
   * - 自身では座標計算を持たず、呼び出し元が bot 要素の子として配置し、この
   *   class で相対位置（bot 頭上等）を指定する想定（issue #137）
   */
  className: string
  /** クリック時。中継点選択モードへ移行する */
  onClick: () => void
  /**
   * 中継点選択モードが選択可能な状態か。枠線を点線にする
   *
   * - store で中継点選択モードを管理する想定の props（issue #137、現状
   *   `index.tsx` からは固定値で渡す。store 接続は次段階）
   */
  selectable: boolean
  /** 表示するか（`waypointFlowState === 'proposing'`） */
  visible: boolean
}

/**
 * 中継点選択モードへの導線となる思考吹き出し
 *
 * - 表示/非表示は `useCssToggle`（`src/hooks/use-css-toggle`）で自己管理する。
 *   `visible` prop の変化を hidden checkbox の checked へ同期するだけで、
 *   React state による条件付きレンダリング（マウント/アンマウント）は行わない。
 *   常時マウントしたまま CSS で表示切替するため、`visible` の変化元
 *   （`index.tsx` の `waypointFlowState`）が再レンダリングされてもこの
 *   コンポーネント自身は `React.memo` によりスキップされる
 * - 自身では座標計算を持たない。呼び出し元が `Stage07` の
 *   `registerPlayerOverlayContainer` が公開するコンテナへ `createPortal` で
 *   注入し（bot の位置決め div 内、複数の吹き出しを同時注入することも想定）、
 *   `className`（既定は `WAYPOINT_BUBBLE_POSITION_CLASS_NAME`）で相対位置
 *   （bot 頭上等）を指定する想定（issue #137）。bot 要素側が floor の tilt
 *   打ち消し（逆 `rotateX`）を既に適用しているため、この吹き出し自身は
 *   tilt を意識しなくてよい
 * - 見た目を作り込む前段階の暫定実装（issue #137）。枠線はグレー、`selectable`
 *   （選択可能な状態）時のみ点線にする。文言は仮で「中継？」
 */
export const WaypointBubble = memo((props: WaypointBubbleProps) => {
  const { className, onClick, selectable, visible } = props

  const { checkbox, set: setToggled, toggledClassName } = useCssToggle()

  useEffect(() => {
    setToggled(visible)
  }, [setToggled, visible])

  const bubbleStyle: CSSProperties = {
    background: '#fff',
    border: `2px ${selectable ? 'dashed' : 'solid'} #9ca3af`,
    borderRadius: 4,
    fontSize: 12,
    padding: '2px 6px',
    position: 'absolute',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      className={className}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        transformStyle: 'preserve-3d',
      }}
    >
      {checkbox}
      <button
        aria-label="中継点選択モードへ移行"
        className={toggledClassName}
        onClick={onClick}
        style={bubbleStyle}
        type="button"
      >
        中継？
      </button>
    </div>
  )
})

WaypointBubble.displayName = 'WaypointBubble'
