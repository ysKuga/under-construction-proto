import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { isObstacleCell } from './obstacle'
import { isBlockedByOneWay } from './one-way'

/**
 * 経路探索(BFS)用の進入可否判定（EN 残量チェックは含まない、静的な障害物・
 * 一方通行のみ）
 *
 * - stage content の `enterGuards`（`currentCell` に固定された perceived ガード）
 *   とは別に用意する。一方通行判定(`isBlockedByOneWay`)は移動元セルに依存するため、
 *   探索中に動く `from` をそのまま受け取れる形にする必要がある
 * - EN 残量は探索実行の瞬間の値でしかなく、経路の各手で消費されていく動的資源
 *   のため経路の「形」自体には含めない（不足時の扱いは自動移動実装時に検討）
 *
 * @param from 移動元セル
 * @param to 移動先セル
 */
export const canEnterForPath = (from: HexCell, to: HexCell): boolean =>
  !isObstacleCell(to) && !isBlockedByOneWay(from, to)
