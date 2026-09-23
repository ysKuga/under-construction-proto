import { CSSProperties, memo } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

type ObjectiveMarkerLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** 目標セル。未指定なら何も表示しない */
  objectiveCell: HexCell | undefined
  /** 行数 */
  rows: number
}

/**
 * 目標セルの表示レイヤー
 *
 * - 非隣接クリックで指定した目標セルへ、経路プレビューと同色のリングを表示する
 *   非対話層（`PathPreviewLayer` 同型）。経路プレビューの点だけでは終端が
 *   どこか分からないため（issue #226）
 * - ゴールの旗（`GoalMarkerLayer`）・中継点の 📍 と見分けがつくよう、絵文字でなく
 *   リングにする。ゴールセルを目標にした場合も旗を囲む形で重なる
 * - `registerVisibilityNode` は持たない（`PathPreviewLayer` と同じく、プレイヤーが
 *   選んだ移動先を示す表示のため常時表示）
 */
export const ObjectiveMarkerLayer = memo((props: ObjectiveMarkerLayerProps) => {
  const { cols, hexSize, objectiveCell, rows } = props

  if (!objectiveCell) return null

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(objectiveCell, hexSize, bounds)

  const style: CSSProperties = {
    border: '3px solid #0284c7',
    borderRadius: '50%',
    height: bounds.cellHeight * 0.7,
    left: center.x,
    pointerEvents: 'none',
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -50%)',
    width: bounds.cellHeight * 0.7,
  }

  return <div style={style} />
})

ObjectiveMarkerLayer.displayName = 'ObjectiveMarkerLayer'
