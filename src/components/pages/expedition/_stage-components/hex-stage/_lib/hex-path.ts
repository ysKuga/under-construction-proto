import { HEX_DIRECTIONS, HexCell, isHexCellInGrid } from './hex'

/** セルを Map/Set のキーへ変換する */
const cellKey = (cell: HexCell): string => `${cell.q},${cell.r}`

/**
 * `cameFrom`（各セル→直前セルの対応）を `goal` から `start` へ遡って
 * 経路（`start` は含めない、`goal` まで）へ組み立てる
 */
const buildPath = (
  cameFrom: Map<string, HexCell>,
  goal: HexCell,
): HexCell[] => {
  const path: HexCell[] = [goal]
  let cursor = goal

  for (;;) {
    const prev = cameFrom.get(cellKey(cursor))

    if (!prev) break

    path.unshift(prev)
    cursor = prev
  }

  // 先頭は start 自体のため除く
  return path.slice(1)
}

/**
 * 幅優先探索(BFS)で `start` から `goal` への最短経路を求める
 *
 * - hex グリッドは辺の重みが均一なため BFS で最短経路が求まる
 * - 経路が存在しない場合（`canEnter` に阻まれ到達不能、`goal` がグリッド範囲外等）
 *   は `undefined` を返す
 *
 * @param start 探索開始セル（経路には含めない）
 * @param goal 目標セル
 * @param cols グリッド列数
 * @param rows グリッド行数
 * @param canEnter 移動元→移動先への進入可否（省略時は常に進入可能）。一方通行
 *   セルのように移動元セルへ依存する判定を表現するため `from` も渡す
 */
export const findHexPath = (
  start: HexCell,
  goal: HexCell,
  cols: number,
  rows: number,
  canEnter?: (from: HexCell, to: HexCell) => boolean,
): HexCell[] | undefined => {
  if (start.q === goal.q && start.r === goal.r) return []

  const visited = new Set<string>([cellKey(start)])
  const cameFrom = new Map<string, HexCell>()
  const queue: HexCell[] = [start]

  while (queue.length > 0) {
    const current = queue.shift()!

    for (const direction of HEX_DIRECTIONS) {
      const next = { q: current.q + direction.q, r: current.r + direction.r }

      if (!isHexCellInGrid(next, cols, rows)) continue
      if (visited.has(cellKey(next))) continue
      if (canEnter && !canEnter(current, next)) continue

      visited.add(cellKey(next))
      cameFrom.set(cellKey(next), current)

      if (next.q === goal.q && next.r === goal.r) {
        return buildPath(cameFrom, next)
      }

      queue.push(next)
    }
  }

  return undefined
}
