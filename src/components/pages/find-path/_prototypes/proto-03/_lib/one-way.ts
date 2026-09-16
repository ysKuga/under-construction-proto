import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { ONE_WAY_CELLS } from '../constants'

/** 一方通行セルの退出方向（axial の6近傍、`HEX_DIRECTIONS` と対応） */
export type OneWayDirection =
  'left' | 'lower-left' | 'lower-right' | 'right' | 'upper-left' | 'upper-right'

const DIRECTION_DELTA: Record<OneWayDirection, HexCell> = {
  left: { q: -1, r: 0 },
  'lower-left': { q: -1, r: 1 },
  'lower-right': { q: 0, r: 1 },
  right: { q: 1, r: 0 },
  'upper-left': { q: 0, r: -1 },
  'upper-right': { q: 1, r: -1 },
}

/** 退出方向 → 反対方向（進入禁止方向。`_components/one-way-layer` のバリア線から参照） */
export const OPPOSITE_DIRECTION: Record<OneWayDirection, OneWayDirection> = {
  left: 'right',
  'lower-left': 'upper-right',
  'lower-right': 'upper-left',
  right: 'left',
  'upper-left': 'lower-right',
  'upper-right': 'lower-left',
}

/**
 * from→to の移動が一方通行セル(to)の退出方向に逆行するか判定する
 *
 * - to が一方通行セルでなければ常に false
 * - 進入方向が退出方向の逆（出口側からの進入）のときのみ block する（proto-01
 *   `_lib/one-way.ts` と同じ意味論。decision-records.md 2026-09-16 退出方向固定型）
 */
export const isBlockedByOneWay = (from: HexCell, to: HexCell): boolean => {
  const oneWay = ONE_WAY_CELLS.find(
    (cell) => cell.q === to.q && cell.r === to.r,
  )

  if (!oneWay) {
    return false
  }

  const delta = { q: to.q - from.q, r: to.r - from.r }
  const moveDirection = (
    Object.keys(DIRECTION_DELTA) as OneWayDirection[]
  ).find(
    (direction) =>
      DIRECTION_DELTA[direction].q === delta.q &&
      DIRECTION_DELTA[direction].r === delta.r,
  )

  return moveDirection === OPPOSITE_DIRECTION[oneWay.exitDirection]
}
