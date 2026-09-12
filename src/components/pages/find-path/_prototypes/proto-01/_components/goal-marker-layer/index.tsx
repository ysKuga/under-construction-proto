import { CSSProperties } from 'react'

import { GOAL_POSITION } from '../../constants'

type GoalMarkerLayerProps = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/** セル1マスのスタイル */
const cellStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  fontSize: 20,
  justifyContent: 'center',
}

/**
 * ゴールセルの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `GOAL_POSITION` のセルにマーカーを表示するだけの非対話層
 * - `pointerEvents: none` でクリックを下層（`PlannedPathLayer`）へ通す
 */
export const GoalMarkerLayer = (props: GoalMarkerLayerProps) => {
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
        Array.from({ length: cols }).map((_, col) => (
          <div key={`${row}-${col}`} style={cellStyle}>
            {col === GOAL_POSITION.col && row === GOAL_POSITION.row ? '🚩' : ''}
          </div>
        )),
      )}
    </div>
  )
}
