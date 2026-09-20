import { CSSProperties } from 'react'

import { isObstacleCell } from '../../_lib/obstacle'

type ObstacleLayerProps = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/**
 * セル1マスのスタイル
 *
 * - `gridColumn`/`gridRow` を明示指定する（`GoalMarkerLayer` と同じ理由）
 */
const cellStyle = (col: number, row: number): CSSProperties => ({
  alignItems: 'center',
  backgroundColor: 'rgba(15, 23, 42, 0.6)',
  display: 'flex',
  fontSize: 20,
  gridColumn: col + 1,
  gridRow: row + 1,
  justifyContent: 'center',
})

/**
 * 障害物セルの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `OBSTACLE_CELLS` のセルを塗りつぶすだけの非対話層
 * - `pointerEvents: none` でクリックを下層（`PlannedPathLayer`）へ通す。
 *   選択拒否自体は `PlannedPathLayer` 側の `isObstacleCell` 判定で行う
 */
export const ObstacleLayer = (props: ObstacleLayerProps) => {
  const { cols, rows } = props

  const overlayStyle: CSSProperties = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
  }

  return (
    <div style={overlayStyle}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          if (!isObstacleCell({ col, row })) {
            return null
          }

          return (
            <div
              className="ui-term-obstacle"
              key={`${row}-${col}`}
              style={cellStyle(col, row)}
            >
              🪨
            </div>
          )
        }),
      )}
    </div>
  )
}
