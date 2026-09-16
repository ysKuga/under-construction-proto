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

const OPPOSITE_DIRECTION: Record<OneWayDirection, OneWayDirection> = {
  down: 'up',
  left: 'right',
  right: 'left',
  up: 'down',
}

/**
 * from→to の移動が一方通行セル(to)の退出方向に逆行するか判定する
 *
 * - to が一方通行セルでなければ常に false
 * - 進入方向が退出方向の逆（出口側からの進入）のときのみ block する。\
 *   垂直方向からの進入は許可する（decision-records.md 2026-09-16 退出方向固定型）
 */
export const isBlockedByOneWay = (
  from: GridPosition,
  to: GridPosition,
): boolean => {
  const oneWay = ONE_WAY_CELLS.find(
    (cell) => cell.col === to.col && cell.row === to.row,
  )

  if (!oneWay) {
    return false
  }

  const delta = { col: to.col - from.col, row: to.row - from.row }
  const moveDirection = (
    Object.keys(DIRECTION_DELTA) as OneWayDirection[]
  ).find(
    (direction) =>
      DIRECTION_DELTA[direction].col === delta.col &&
      DIRECTION_DELTA[direction].row === delta.row,
  )

  return moveDirection === OPPOSITE_DIRECTION[oneWay.exitDirection]
}
