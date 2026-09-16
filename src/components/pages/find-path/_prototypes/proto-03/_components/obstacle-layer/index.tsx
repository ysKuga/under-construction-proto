import { CSSProperties } from 'react'

import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { OBSTACLE_CELLS } from '../../constants'

type ObstacleLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** 行数 */
  rows: number
}

/**
 * 障害物セルの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。`OBSTACLE_CELLS`
 *   (axial) のセルを塗りつぶすだけの非対話層
 * - 座標計算は `GeoLayer`/`ActorsLayer` と同じ `computeHexGridBounds`/`hexCellCenter`
 *   を共有し、見た目位置がズレないようにする
 * - `pointerEvents: none` でクリックを下層（`GeoLayer`）へ通す。選択拒否自体は
 *   `Stage07` の `canEnterCell` 判定（`useHexMove` 組込み）で行う
 */
export const ObstacleLayer = (props: ObstacleLayerProps) => {
  const { cols, hexSize, rows } = props

  const bounds = computeHexGridBounds(cols, rows, hexSize)

  return (
    <>
      {OBSTACLE_CELLS.map((cell) => {
        const center = hexCellCenter(cell, hexSize, bounds)

        const style: CSSProperties = {
          alignItems: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '50%',
          display: 'flex',
          fontSize: 20,
          height: bounds.cellHeight * 0.7,
          justifyContent: 'center',
          left: center.x,
          pointerEvents: 'none',
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -50%)',
          width: bounds.cellWidth * 0.7,
        }

        return (
          <div key={`${cell.q},${cell.r}`} style={style}>
            🪨
          </div>
        )
      })}
    </>
  )
}
