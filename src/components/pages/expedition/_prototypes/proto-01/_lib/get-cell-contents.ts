import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'

import { CellContent, ItemState } from '../_stores/items/types'

import { isObstacleCell } from './obstacle'

/**
 * セル上の要素（障害物・アイテム）を種類問わず横断的に取得する
 *
 * - 障害物（`_lib/obstacle.ts`、静的定数）とアイテム（`ItemStore`）は責務を分けたまま
 *   独立管理する。この関数はその両方を問い合わせるだけの薄い橋渡し役（issue #137、
 *   PR #196 レビュー対応）。`itemState` は `ItemStore` の `getItemAtCell` のみに
 *   依存する（`Pick` で明示）
 */
export const getCellContents = (
  cell: GridPosition,
  itemState: Pick<ItemState, 'getItemAtCell'>,
): CellContent[] => {
  const contents: CellContent[] = []

  if (isObstacleCell(cell)) {
    contents.push({ kind: 'obstacle' })
  }

  const item = itemState.getItemAtCell(cell)

  if (item) {
    contents.push({ item, kind: 'item' })
  }

  return contents
}
