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
  /** 現在地セル。移動可能マス(隣接6方向)の算出・表示演出のトリガーに使う */
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
 */
export const MoveTargetLayer = memo((props: MoveTargetLayerProps) => {
  const { canEnterCell, cols, currentCell, hexSize, mode, rows } = props

  const energyInfo = useEnergyStore((state) =>
    state.getEnergyInfo(PLAYER_ACTOR_ID),
  )

  /** `canEnterCell`（EN を除く、props 由来）に EN 残量チェックを合成する */
  const canEnterCellWithEnergy = useCallback(
    (cell: HexCell) => (canEnterCell?.(cell) ?? true) && energyInfo.current > 0,
    [canEnterCell, energyInfo],
  )

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const moveTargetLayer = useMoveTargetLayer(
    currentCell,
    cols,
    hexSize,
    mode,
    rows,
    canEnterCellWithEnergy,
  )

  return (
    <>
      {moveTargetLayer.map(({ cell, opacity, position, scale }) => {
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
