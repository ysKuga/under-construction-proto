import { CSSProperties } from 'react'

import { OneWayDirection, OPPOSITE_DIRECTION } from '../../_lib/one-way'
import { ONE_WAY_CELLS } from '../../constants'

type OneWayLayerProps = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/** 進入禁止方向 → バリア線を引く辺 */
const BARRIER_SIDE: Record<
  OneWayDirection,
  'borderBottom' | 'borderLeft' | 'borderRight' | 'borderTop'
> = {
  down: 'borderBottom',
  left: 'borderLeft',
  right: 'borderRight',
  up: 'borderTop',
}

/**
 * セル1マスのスタイル
 *
 * - `gridColumn`/`gridRow` を明示指定する（`ObstacleLayer` と同じ理由）
 * - 退出方向の反対側（進入禁止方向）の辺だけへ赤いバリア線を引く
 */
const cellStyle = (
  col: number,
  row: number,
  exitDirection: OneWayDirection,
): CSSProperties => ({
  [BARRIER_SIDE[OPPOSITE_DIRECTION[exitDirection]]]: '4px solid #dc2626',
  gridColumn: col + 1,
  gridRow: row + 1,
})

/**
 * 一方通行セルの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `ONE_WAY_CELLS` の各セルへ進入禁止方向（退出方向の反対側）のバリア線を
 *   表示するだけの非対話層
 * - 矢印表示（退出方向を指す）は「その方向にしか行けない」ように見え、実際の
 *   判定（進入方向が退出方向の逆のときだけ拒否。垂直方向からの進入は許可）と
 *   見た目が食い違うため不採用（issue #137 検討）
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
          style={cellStyle(cell.col, cell.row, cell.exitDirection)}
        />
      ))}
    </div>
  )
}
