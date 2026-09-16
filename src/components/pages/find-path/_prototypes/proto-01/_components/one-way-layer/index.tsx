import { CSSProperties } from 'react'

import { OneWayDirection } from '../../_lib/one-way'
import { ONE_WAY_CELLS } from '../../constants'

type OneWayLayerProps = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/**
 * セル1マスのスタイル
 *
 * - `gridColumn`/`gridRow` を明示指定する（`ObstacleLayer` と同じ理由）
 */
const cellStyle = (col: number, row: number): CSSProperties => ({
  alignItems: 'center',
  display: 'flex',
  fontSize: 20,
  gridColumn: col + 1,
  gridRow: row + 1,
  justifyContent: 'center',
})

/** 退出方向 → 矢印絵文字 */
const DIRECTION_ARROW: Record<OneWayDirection, string> = {
  down: '⬇️',
  left: '⬅️',
  right: '➡️',
  up: '⬆️',
}

/**
 * 一方通行セルの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `ONE_WAY_CELLS` の各セルへ退出方向の矢印を表示するだけの非対話層
 * - `pointerEvents: none` でクリックを下層（`PlannedPathLayer`）へ通す。
 *   選択拒否自体は `PlannedPathLayer` 側の `isBlockedByOneWay` 判定で行う
 */
export const OneWayLayer = (props: OneWayLayerProps) => {
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
      {ONE_WAY_CELLS.map((cell) => (
        <div
          key={`${cell.row}-${cell.col}`}
          style={cellStyle(cell.col, cell.row)}
        >
          {DIRECTION_ARROW[cell.exitDirection]}
        </div>
      ))}
    </div>
  )
}
