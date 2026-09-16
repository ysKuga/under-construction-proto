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
 * a がバリアセルで、b が a の進入禁止方向（退出方向の反対側）にある隣接セルか判定する
 */
const hasBarrierBetween = (a: HexCell, b: HexCell): boolean => {
  const oneWay = ONE_WAY_CELLS.find((cell) => cell.q === a.q && cell.r === a.r)

  if (!oneWay) {
    return false
  }

  const barrierDelta = DIRECTION_DELTA[OPPOSITE_DIRECTION[oneWay.exitDirection]]

  return b.q === a.q + barrierDelta.q && b.r === a.r + barrierDelta.r
}

/**
 * from-to 間に壁があるか判定する（proto-01 `_lib/one-way.ts` と同じ意味論）
 *
 * - 一方通行セルの退出方向の反対側の辺には壁があり、跨ぐ移動は方向を問わず\
 *   常に拒否する（decision-records.md 2026-09-16 壁化）
 */
export const isBlockedByOneWay = (from: HexCell, to: HexCell): boolean =>
  hasBarrierBetween(from, to) || hasBarrierBetween(to, from)
