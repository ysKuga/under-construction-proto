import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { StageLayout } from '../_contexts/stage-layout/types'
import { CellContent, ItemState } from '../_stores/items/types'

import { isObstacleCell } from './obstacle'

/**
 * セル上の要素（障害物・アイテム）を種類問わず横断的に取得する
 *
 * - 障害物（`_lib/obstacle.ts`、盤面配置）とアイテム（`ItemStore`）は責務を分けたまま
 *   独立管理する。この関数はその両方を問い合わせるだけの薄い橋渡し役（issue #137。
 *   proto-01 の同型を axial 座標へ移植）。`itemState` は `ItemStore` の
 *   `getItemAtCell` のみに依存する（`Pick` で明示）
 *
 * @param cell 対象セル
 * @param itemState アイテム store の状態
 * @param stageLayout 盤面配置
 */
export const getCellContents = (
  cell: HexCell,
  itemState: Pick<ItemState, 'getItemAtCell'>,
  stageLayout: Pick<StageLayout, 'obstacles'>,
): CellContent[] => {
  const contents: CellContent[] = []

  if (isObstacleCell(cell, stageLayout)) {
    contents.push({ kind: 'obstacle' })
  }

  const item = itemState.getItemAtCell(cell)

  if (item) {
    contents.push({ item, kind: 'item' })
  }

  return contents
}
