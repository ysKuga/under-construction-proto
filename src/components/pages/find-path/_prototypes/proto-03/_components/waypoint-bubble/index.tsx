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
 * - `rotateX(calc(-1 * var(--floor-tilt, 0deg)))` で `Stage07` の floor の傾き
 *   （tilt）を打ち消す。`ActorsLayer` の bot 本体と同じ手法（`Stage07` 内コメント
 *   参照）。フォールバック値 `0deg` は Storybook 等 `--floor-tilt` 未定義の環境で
 *   `transform` 自体が invalid にならないようにするため
 * - 見た目を作り込む前段階の暫定実装（issue #137）。枠線はグレー、`selectable`
 *   （選択可能な状態）時のみ点線にする。文言は仮で「中継？」。`rotateX` +
 *   `preserve-3d` 環境のブラウザ奥行きヒットテストに `GeoLayer` セルへクリックを
 *   奪われる問題への対処（`translateZ` 押し出し等）は見た目確定後に再検討する
 */
export const WaypointBubble = memo((props: WaypointBubbleProps) => {
  const {
    botSize,
    cols,
    currentCell,
    hexSize,
    onClick,
    rows,
    selectable,
    visible,
  } = props

  const { checkbox, set: setToggled, toggledClassName } = useCssToggle()

  useEffect(() => {
    setToggled(visible)
  }, [setToggled, visible])

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(currentCell, hexSize, bounds)

  const bubbleStyle: CSSProperties = {
    background: '#fff',
    border: `2px ${selectable ? 'dashed' : 'solid'} #9ca3af`,
    borderRadius: 4,
    fontSize: 12,
    left: center.x,
    padding: '2px 6px',
    position: 'absolute',
    top: center.y,
    transform: `translate(-50%, calc(-100% - ${botSize}px - ${MARGIN_ABOVE_BOT_PX}px)) rotateX(calc(-1 * var(--floor-tilt, 0deg)))`,
    whiteSpace: 'nowrap',
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
      >
        中継？
      </button>
    </div>
  )
})

WaypointBubble.displayName = 'WaypointBubble'
