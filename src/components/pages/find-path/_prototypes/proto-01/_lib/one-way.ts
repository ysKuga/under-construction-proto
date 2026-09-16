import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { ONE_WAY_CELLS } from '../constants'

/** 一方通行セルの退出方向 */
export type OneWayDirection = 'down' | 'left' | 'right' | 'up'

const DIRECTION_DELTA: Record<OneWayDirection, GridPosition> = {
  down: { col: 0, row: 1 },
  left: { col: -1, row: 0 },
  right: { col: 1, row: 0 },
  up: { col: 0, row: -1 },
}

/** 退出方向 → 反対方向（進入禁止方向。`_components/one-way-layer` のバリア線から参照） */
export const OPPOSITE_DIRECTION: Record<OneWayDirection, OneWayDirection> = {
  down: 'up',
  left: 'right',
  right: 'left',
  up: 'down',
}

/**
 * a がバリアセルで、b が a の進入禁止方向（退出方向の反対側）にある隣接セルか判定する
 */
const hasBarrierBetween = (a: GridPosition, b: GridPosition): boolean => {
  const oneWay = ONE_WAY_CELLS.find(
    (cell) => cell.col === a.col && cell.row === a.row,
  )

  if (!oneWay) {
    return false
  }

  const barrierDelta = DIRECTION_DELTA[OPPOSITE_DIRECTION[oneWay.exitDirection]]

  return (
    b.col === a.col + barrierDelta.col && b.row === a.row + barrierDelta.row
  )
}

/**
 * from-to 間に壁があるか判定する
 *
 * - 一方通行セルの退出方向の反対側の辺には壁があり、跨ぐ移動は方向を問わず\
 *   常に拒否する（decision-records.md 2026-09-16 壁化）
 */
export const isBlockedByOneWay = (
  from: GridPosition,
  to: GridPosition,
): boolean => hasBarrierBetween(from, to) || hasBarrierBetween(to, from)
