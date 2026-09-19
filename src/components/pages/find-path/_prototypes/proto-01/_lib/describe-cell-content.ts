import { CellContent, ItemKind } from '../_stores/items/types'

/**
 * アイテム種別ごとの説明文言
 *
 * - `item`: 即時使用アイテム相当（`stock` 未指定）。`spot`: 据置スポット相当
 *   （`stock` 指定）。新しい `ItemKind` を追加する際はここへエントリを足すだけで
 *   `describeCellContent` は対応できる（issue #137、PR #196 レビュー対応）
 */
const ITEM_DESCRIPTIONS: Record<ItemKind, { item: string; spot: string }> = {
  'energy-recovery': {
    item: '回復アイテム（踏むとエネルギー回復、1個限り）',
    spot: '回復スポット（到達するとエネルギー回復、在庫が尽きるまで複数回）',
  },
}

/** セル上の要素（障害物・アイテム）の hover 説明文言 */
export const describeCellContent = (content: CellContent): string => {
  if (content.kind === 'obstacle') {
    return '障害物（通行不可）'
  }

  return content.item.stock !== undefined
    ? ITEM_DESCRIPTIONS[content.item.kind].spot
    : ITEM_DESCRIPTIONS[content.item.kind].item
}
