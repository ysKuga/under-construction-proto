'use client'

import { CSSProperties } from 'react'

import { HEX_INSET_RATIO } from '@/prototypes/stage/stage-07/_components/geo-layer'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexPolygonPoints,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { MoveTargetDisplayMode, useMoveTargetLayer } from './index.hooks'

export type { MoveTargetDisplayMode }

type MoveTargetLayerProps = {
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
 *   （詳細は同フックの JSDoc 参照）。ここでは渡された位置・不透明度へ `GeoLayer`
 *   と同じ点線六角形（選択可能マスの見た目）を CSS transition で描画するだけ
 */
export const MoveTargetLayer = (props: MoveTargetLayerProps) => {
  const { cols, currentCell, hexSize, mode, rows } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const moveTargetLayer = useMoveTargetLayer(
    currentCell,
    cols,
    hexSize,
    mode,
    rows,
  )

  return (
    <>
      {moveTargetLayer.map(({ cell, opacity, position }) => {
        const style: CSSProperties = {
          height: bounds.cellHeight,
          left: position.x,
          opacity,
          pointerEvents: 'none',
          position: 'absolute',
          top: position.y,
          transform: 'translate(-50%, -50%)',
          transition:
            'left 200ms ease-out, opacity 200ms ease-out, top 200ms ease-out',
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
}
