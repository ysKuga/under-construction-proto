import { CSSProperties, memo } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
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
  /**
   * 障害物セルの DOM を visibility registry へ登録する
   *
   * - 省略時は常時表示。渡した場合は未到達マスへ隣接するまで岩が非表示になる
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
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
 * - `registerVisibilityNode` 経由で障害物セルの DOM を visibility registry へ登録する
 *   （渡された場合のみ）。未到達マスの岩が視界外から見えてしまうのを防ぐ
 * - `React.memo` 化済み（issue-181-en backlog）。EN 残量等の find-path 固有の
 *   状態変化に巻き込まれて再レンダリングしない
 */
export const ObstacleLayer = memo((props: ObstacleLayerProps) => {
  const { cols, hexSize, registerVisibilityNode, rows } = props

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
          <div
            className="ui-term-obstacle"
            key={`${cell.q},${cell.r}`}
            ref={(el) => registerVisibilityNode?.(cell, el)}
            style={style}
          >
            🪨
          </div>
        )
      })}
    </>
  )
})

ObstacleLayer.displayName = 'ObstacleLayer'
