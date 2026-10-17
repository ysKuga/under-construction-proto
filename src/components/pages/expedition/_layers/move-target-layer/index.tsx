'use client'

import { CSSProperties, memo } from 'react'

import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HEX_INSET_RATIO } from '@/prototypes/stage/stage-07/_components/geo-layer'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexPolygonPoints,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'
import { useFollowPathStore } from '../../_stores/follow-path'

import { useReachedCell } from './_hooks/use-reached-cell'
import { MOVE_TARGET_TRANSITION_MS, useMoveTargetLayer } from './index.hooks'

type MoveTargetLayerProps = {
  /**
   * 対象セルへ進入可能か（省略時は常に進入可能）。障害物セル等を除外する
   *
   * - EN 残量チェックは含まない。EN 残量は `MoveTargetLayer` 自身が EN store を
   *   直接購読し、EN 切れで表示を引っ込める（issue-181-en backlog: `EnergyDebugPanel` 操作で
   *   `Stage07` 配下ツリー全体が再レンダリングされる問題の解消）
   */
  canEnterCell?: (cell: HexCell) => boolean
  /** 列数 */
  cols: number
  /** 現在地セル。bot がこのセルの中心に着くまで移動可能マスを表示しない */
  currentCell: HexCell
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** 表示演出の種類 */
  mode: MoveTargetDisplayMode
  /** 行数 */
  rows: number
}

/**
 * 移動可能マスの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。非対話
 *   (`pointerEvents: none`) でクリックは下層（`GeoLayer`）へ通す
 * - 表示演出（非表示 → 出現準備 → 表示）は `useMoveTargetLayer` が管理する
 *   （詳細は同フックの JSDoc 参照）。ここでは渡された位置・不透明度・拡大率へ
 *   `GeoLayer` と同じ点線六角形（選択可能マスの見た目）を CSS transition で
 *   描画するだけ
 * - `React.memo` 化済み（issue-181-en backlog）。EN 残量は props 経由でなく
 *   `useEnergyStore` を直接購読するため、EN 変化時は親を経由せず自分自身のみが
 *   再レンダリングされる
 * - EN 切れで表示と逆の演出で引っ込め、復帰で移動直後と同じ演出で表示する
 *   （`useMoveTargetLayer` の `isEnabled`、issue #226）
 * - 経路に沿った自動移動中は表示しない。途中のマスでは止まらないため、進入のたびに
 *   表示が出ると歩いている途中に見えてしまう。自動移動中かは follow-path store を
 *   直接購読して判定する（issue #226）
 * - bot が現在地セルの中心に着くまで表示しない。現在地セルは進入開始時に切り替わる
 *   ため、移動時間が長いと歩いている途中に次の移動可能マスが出てしまう。到達は
 *   `Stage07-cell-reach` を購読して知る（`useReachedCell`、issue #226）
 */
export const MoveTargetLayer = memo((props: MoveTargetLayerProps) => {
  const { canEnterCell, cols, currentCell, hexSize, mode, rows } = props

  /** EN 残量があるか（EN 切れなら移動可能マスを引っ込める） */
  const hasEnergy = useEnergyStore(
    (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current > 0,
  )

  /** 自動移動中か（途中のマスでは移動可能マスを表示しない） */
  const isFollowing = useFollowPathStore((state) => state.isFollowing())
  const reachedCell = useReachedCell(PLAYER_ACTOR_ID)
  /** bot が現在地セルの中心に着いたか（着くまで移動可能マスを表示しない） */
  const hasReachedCurrentCell =
    reachedCell?.q === currentCell.q && reachedCell.r === currentCell.r

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  // 表示演出は中心への到達を契機に始めるため、到達したセルを基準にする
  // （未到達の間は `hasReachedCurrentCell` で表示しない）
  const moveTargetLayer = useMoveTargetLayer(
    reachedCell ?? currentCell,
    cols,
    hexSize,
    hasEnergy,
    mode,
    rows,
    canEnterCell,
  )

  return (
    <>
      {!isFollowing &&
        hasReachedCurrentCell &&
        moveTargetLayer.map(({ cell, opacity, position, scale }) => {
          const style: CSSProperties = {
            height: bounds.cellHeight,
            left: position.x,
            opacity,
            pointerEvents: 'none',
            position: 'absolute',
            top: position.y,
            transform: `translate(-50%, -50%) scale(${scale})`,
            transition: ['left', 'opacity', 'top', 'transform']
              .map(
                (property) =>
                  `${property} ${MOVE_TARGET_TRANSITION_MS}ms ease-out`,
              )
              .join(', '),
            width: bounds.cellWidth,
          }

          return (
            <div key={`${cell.q},${cell.r}`} style={style}>
              <svg height={bounds.cellHeight} width={bounds.cellWidth}>
                <polygon
                  fill="none"
                  points={hexPolygonPoints(hexSize, HEX_INSET_RATIO)}
                  stroke="#0284c7"
                  strokeDasharray="4 3"
                  strokeWidth={2}
                />
              </svg>
            </div>
          )
        })}
    </>
  )
})

MoveTargetLayer.displayName = 'MoveTargetLayer'
