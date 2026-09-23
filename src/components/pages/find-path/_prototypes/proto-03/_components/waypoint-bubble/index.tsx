'use client'

import { CSSProperties, memo, useEffect } from 'react'

import { useCssToggle } from '@/hooks/use-css-toggle'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

/** bot 頭上からのマージン(px) */
const MARGIN_ABOVE_BOT_PX = 10

type WaypointBubbleProps = {
  /** bot(box-bot-01)の一辺 px。`Stage07`/`ActorsLayer` へ渡す値と同じものを渡す */
  botSize: number
  /** 列数 */
  cols: number
  /** bot の現在地セル（吹き出しの表示位置の基準） */
  currentCell: HexCell
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** クリック時。中継点選択モードへ移行する */
  onClick: () => void
  /** 行数 */
  rows: number
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
 * - wrapper の `position: 'absolute'`（`Stage07` の floor(3D 空間) 全体を覆う
 *   絶対配置オーバーレイにする。指定しないと通常のブロック要素として
 *   ドキュメントフローに乗ってしまい、内部の絶対位置計算の基準が floor
 *   全体からズレる）・`pointerEvents: 'none'`（指定しないと非表示時も
 *   wrapper 自体が `GeoLayer` のクリックをブロックしてしまう。内側の対象は
 *   `useCssToggle` の `toggledClassName` が表示時に `pointer-events: auto`
 *   を明示するため子要素側で上書きされる）は必須。`index.tsx` 側で他の
 *   `useCssToggle` インスタンス（`WaypointSelectLayer` 用等）と同じ親に
 *   並べると vanilla-extract の `~` セレクタが衝突する（Storybook
 *   `SharedScope` ストーリーが警告する既知の制約、実機検証で発覚）ため、
 *   専用の wrapper を持たせてスコープを分離する意図も兼ねる
 * - 位置確認のための暫定実装。`border` を付けた `button` で表示位置のみ確認する
 *   （issue #137、見た目を作り込む前段階）。`rotateX` + `preserve-3d` 環境の
 *   ブラウザ奥行きヒットテストに `GeoLayer` セルへクリックを奪われる問題への
 *   対処（`translateZ` 押し出し等）は見た目確定後に再検討する
 */
export const WaypointBubble = memo((props: WaypointBubbleProps) => {
  const { botSize, cols, currentCell, hexSize, onClick, rows, visible } = props

  const { checkbox, set: setToggled, toggledClassName } = useCssToggle()

  useEffect(() => {
    setToggled(visible)
  }, [setToggled, visible])

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(currentCell, hexSize, bounds)

  const bubbleStyle: CSSProperties = {
    border: '2px solid #0284c7',
    height: 24,
    left: center.x,
    position: 'absolute',
    top: center.y,
    transform: `translate(-50%, calc(-100% - ${botSize}px - ${MARGIN_ABOVE_BOT_PX}px))`,
    width: 24,
  }

  return (
    <div
      style={{
        inset: 0,
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
      />
    </div>
  )
})

WaypointBubble.displayName = 'WaypointBubble'
