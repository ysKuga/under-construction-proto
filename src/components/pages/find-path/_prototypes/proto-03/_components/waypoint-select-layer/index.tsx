'use client'

import { CSSProperties, memo, useEffect } from 'react'

import { useCssToggle } from '@/hooks/use-css-toggle'
import { colRowToAxial, HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

type WaypointSelectLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** セルクリック時。中継点の設置/除去を切替える */
  onCellClick: (cell: HexCell) => void
  /**
   * セル(button)の DOM を visibility registry へ登録する
   *
   * - 省略時は登録しない（常時表示）。渡した場合、視界外(未到達)セルの
   *   ボタンが非表示になり、見えていない場所へ中継点を設置できてしまう
   *   問題を防ぐ
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
  /** 行数 */
  rows: number
  /** 表示するか（`waypointFlowState === 'selecting'`） */
  visible: boolean
  /** 設置済みの中継点一覧。該当セルへマーカー(📍)を重ねて表示する */
  waypoints: HexCell[]
}

/** axial セルの一致判定 */
const isSameCell = (a: HexCell, b: HexCell) => a.q === b.q && a.r === b.r

/**
 * 中継点選択モード中のクリックレイヤー
 *
 * - `Stage07` の `interactive={false}`（`index.tsx` が `waypointFlowState ===
 *   'selecting'` の間切替える）と組ませて使う。`GeoLayer` が非対話になった間、
 *   このレイヤーが全セルのクリックを拾い `onCellClick` を発火する
 * - 通常モードのセルクリック（`useHexMove` 経由、隣接移動・非隣接クリックでの
 *   経路探索）とは別イベントとして完全に分離する（issue #137、中継点機能の設計方針）
 * - `waypoints` に含まれるセルへ 📍 を重ねる。設置操作が見た目に反映されず
 *   「選択できていないように見える」というフィードバック不足の指摘を受けて追加
 *   （issue #137、当初は次段階予定だったが前倒し）。経由順（最近傍）は
 *   `index.tsx` 側の `findHexPathViaWaypoints` が決める（issue #226）
 * - 表示/非表示は `useCssToggle`（`src/hooks/use-css-toggle`）で自己管理する
 *   （`WaypointBubble` と同型）。`visible` prop の変化を hidden checkbox の
 *   checked へ同期するだけで、React state による条件付きレンダリングは行わない
 * - wrapper の `position: 'absolute'`（`Stage07` の floor(3D 空間) 全体を覆う
 *   絶対配置オーバーレイにする。指定しないと通常のブロック要素として
 *   ドキュメントフローに乗ってしまい、内部の絶対位置計算の基準が floor
 *   全体からズレる）・`transformStyle: 'preserve-3d'`（指定しないと子孫が
 *   平坦化され floor の 3D 空間へ参加しなくなる）・`pointerEvents: 'none'`
 *   （指定しないと非表示時も wrapper 自体が `GeoLayer` のクリックをブロック
 *   してしまう。25 個のボタン自体は `toggledClassName` が表示時に
 *   `pointer-events: auto` を明示するため子要素側で上書きされる）は必須。
 *   `index.tsx` 側で他の `useCssToggle` インスタンス（`WaypointBubble` 等）と
 *   同じ親に並べると vanilla-extract の `~` セレクタが衝突する（Storybook
 *   `SharedScope` ストーリーが警告する既知の制約、実機検証で発覚）ため、
 *   専用の wrapper を持たせてスコープを分離する意図も兼ねる
 */
export const WaypointSelectLayer = memo((props: WaypointSelectLayerProps) => {
  const {
    cols,
    hexSize,
    onCellClick,
    registerVisibilityNode,
    rows,
    visible,
    waypoints,
  } = props

  const { checkbox, set: setToggled, toggledClassName } = useCssToggle()

  useEffect(() => {
    setToggled(visible)
  }, [setToggled, visible])

  const bounds = computeHexGridBounds(cols, rows, hexSize)

  const cells = Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: cols }).map((_, col) => colRowToAxial(col, row)),
  )

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
      <div className={toggledClassName}>
        {cells.map((cell) => {
          const center = hexCellCenter(cell, hexSize, bounds)
          const isWaypoint = waypoints.some((waypoint) =>
            isSameCell(waypoint, cell),
          )

          const style: CSSProperties = {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            height: bounds.cellHeight,
            left: center.x,
            lineHeight: `${bounds.cellHeight}px`,
            padding: 0,
            position: 'absolute',
            textAlign: 'center',
            top: center.y,
            transform: 'translate(-50%, -50%)',
            width: bounds.cellWidth,
          }

          return (
            <button
              aria-label={`waypoint ${cell.q}-${cell.r}`}
              key={`${cell.q},${cell.r}`}
              onClick={() => onCellClick(cell)}
              ref={(el) => registerVisibilityNode?.(cell, el)}
              style={style}
              type="button"
            >
              {isWaypoint && '📍'}
            </button>
          )
        })}
      </div>
    </div>
  )
})

WaypointSelectLayer.displayName = 'WaypointSelectLayer'
