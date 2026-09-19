import { ItemInstance, ItemKind } from '../_stores/items/types'

/** アイテム1個の表示情報 */
export type ItemPresentation = {
  /** 表示用 className（issue #137、共通プレフィクス `ui-term-`） */
  className: string
  /** 表示絵文字 */
  emoji: string
  /** hover 説明文言 */
  title: string
}

/**
 * アイテム種別ごとの表示情報
 *
 * - `item`: 即時使用アイテム相当（`stock` 未指定）。`spot`: 据置スポット相当
 *   （`stock` 指定）。新しい `ItemKind` を追加する際はここへエントリを足すだけで
 *   `ItemLayer`/`describeCellContent` は対応できる（issue #137。proto-01 の同型を
 *   axial 座標へ移植）
 */
const ITEM_PRESENTATIONS: Record<
  ItemKind,
  { item: ItemPresentation; spot: ItemPresentation }
> = {
  'energy-recovery': {
    item: {
      className: 'ui-term-energy-recovery-item',
      emoji: '🔋',
      title: '回復アイテム（踏むとエネルギー回復、1個限り）',
    },
    spot: {
      className: 'ui-term-energy-recovery-spot',
      emoji: '⛽',
      title: '回復スポット（到達するとエネルギー回復、在庫が尽きるまで複数回）',
    },
  },
}

/** アイテムの表示情報（className・絵文字・hover 説明文言）を解決する */
export const getItemPresentation = (item: ItemInstance): ItemPresentation =>
  item.stock !== undefined
    ? ITEM_PRESENTATIONS[item.kind].spot
    : ITEM_PRESENTATIONS[item.kind].item
