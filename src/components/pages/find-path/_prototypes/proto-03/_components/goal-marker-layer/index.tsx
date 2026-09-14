import { CSSProperties } from 'react'

import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { GOAL_POSITION } from '../../constants'

type GoalMarkerLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** 行数 */
  rows: number
}

/**
 * ゴールセルの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。`GOAL_POSITION`
 *   (axial) のセル中心へマーカーを表示するだけの非対話層
 * - 座標計算は `GeoLayer`/`ActorsLayer` と同じ `computeHexGridBounds`/`hexCellCenter`
 *   を共有し、見た目位置がズレないようにする
 * - `pointerEvents: none` でクリックを下層（`GeoLayer`）へ通す
 */
export const GoalMarkerLayer = (props: GoalMarkerLayerProps) => {
  const { cols, hexSize, rows } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(GOAL_POSITION, hexSize, bounds)

  const style: CSSProperties = {
    alignItems: 'center',
    display: 'flex',
    fontSize: 20,
    height: bounds.cellHeight,
    justifyContent: 'center',
    left: center.x,
    pointerEvents: 'none',
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -50%)',
    width: bounds.cellWidth,
  }

  return <div style={style}>🚩</div>
}
