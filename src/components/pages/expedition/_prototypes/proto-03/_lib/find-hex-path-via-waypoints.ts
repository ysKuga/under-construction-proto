import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import { findHexPath } from '@/prototypes/stage/stage-07/_lib/hex-path'

import { orderWaypoints } from './order-waypoints'

/**
 * 中継点を経由した `start` から `objective` への経路を求める
 *
 * - 中継点の経由順は `orderWaypoints`(最近傍法)で決め、`objective` は常に最後に経由する
 * - 区間(直前地点 → 次の地点)ごとに `findHexPath` を呼び、経路を連結する
 * - いずれかの区間が到達不能なら `undefined` を返す
 *
 * @param start 探索開始セル(経路には含めない)
 * @param waypoints 設置済みの中継点(設置順)
 * @param objective 目標セル
 * @param cols グリッド列数
 * @param rows グリッド行数
 * @param canEnter 移動元→移動先への進入可否(`findHexPath` へそのまま渡す)
 */
export const findHexPathViaWaypoints = (
  start: HexCell,
  waypoints: readonly HexCell[],
  objective: HexCell,
  cols: number,
  rows: number,
  canEnter?: (from: HexCell, to: HexCell) => boolean,
): HexCell[] | undefined => {
  const stops = [...orderWaypoints(start, waypoints), objective]
  const path: HexCell[] = []
  let cursor = start

  for (const stop of stops) {
    const segment = findHexPath(cursor, stop, cols, rows, canEnter)

    if (!segment) return undefined

    path.push(...segment)
    cursor = stop
  }

  return path
}
