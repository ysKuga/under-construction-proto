'use client'

import { CSSProperties, memo, useCallback } from 'react'

import { useEnergyStore } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HEX_INSET_RATIO } from '@/prototypes/stage/stage-07/_components/geo-layer'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexPolygonPoints,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { useFollowPathStore } from '../../_stores/follow-path'

import { useReachedCell } from './_hooks/use-reached-cell'
import { MoveTargetDisplayMode, useMoveTargetLayer } from './index.hooks'

export type { MoveTargetDisplayMode }

type MoveTargetLayerProps = {
  /**
   * 対象セルへ進入可能か（省略時は常に進入可能）。障害物セル等を除外する
   *
   * - EN 残量チェックは含まない。EN 残量は `MoveTargetLayer` 自身が EN store を
   *   直接購読して適用する（issue-181-en backlog: `EnergyDebugPanel` 操作で
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
 *   `useEnergyStore` を直接購読して判定に合成するため、EN 変化時は親を経由せず
 *   自分自身のみが再レンダリングされる
 * - 経路に沿った自動移動中は表示しない。途中のマスでは止まらないため、進入のたびに
 *   表示が出ると歩いている途中に見えてしまう。自動移動中かは follow-path store を
 *   直接購読して判定する（issue #226）
 * - bot が現在地セルの中心に着くまで表示しない。現在地セルは進入開始時に切り替わる
 *   ため、移動時間が長いと歩いている途中に次の移動可能マスが出てしまう。到達は
 *   `Stage07-cell-reach` を購読して知る（`useReachedCell`、issue #226）
 */
export const MoveTargetLayer = memo((props: MoveTargetLayerProps) => {
  const { canEnterCell, cols, currentCell, hexSize, mode, rows } = props

  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )
  /** `energyInfo.current` を直接 `useCallback` の依存配列に入れると意図せず不安定化するため、プリミティブ値へ切り出す */
  const energyCurrent = energyInfo.current

  /** `canEnterCell`（EN を除く、props 由来）に EN 残量チェックを合成する */
  const canEnterCellWithEnergy = useCallback(
    (cell: HexCell) => (canEnterCell?.(cell) ?? true) && energyCurrent > 0,
    [canEnterCell, energyCurrent],
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
    mode,
    rows,
    canEnterCellWithEnergy,
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
            transition:
              'left 200ms ease-out, opacity 200ms ease-out, top 200ms ease-out, transform 200ms ease-out',
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
