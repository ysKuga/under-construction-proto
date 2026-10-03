import { ReactNode } from 'react'

import { term } from '@/features/term-registry'

import { ItemInstance, ItemKind } from '../_stores/items/types'

/** アイテム1個の表示情報 */
export type ItemPresentation = {
  /** 表示用 className（issue #137、`@/features/term-registry` の用語から参照） */
  className: string
  /** 表示アイコン */
  icon: ReactNode
  /** hover 説明文言 */
  title: string
}

/**
 * アイテム種別ごとの表示情報
 *
 * - `item`: 即時使用アイテム相当（`stock` 未指定）。`spot`: 据置スポット相当
 *   （`stock` 指定）。新しい `ItemKind` を追加する際はここへエントリを足すだけで
 *   `ItemLayer`/`describeCellContent` は対応できる（issue #137）
 */
const ITEM_PRESENTATIONS: Record<
  ItemKind,
  { item: ItemPresentation; spot: ItemPresentation }
> = {
  'energy-recovery': {
    item: {
      className: term.energyRecoveryItem.className,
      icon: term.energyRecoveryItem.icon,
      title: `${term.energyRecoveryItem.name}（踏むとエネルギー補給、1個限り）`,
    },
    spot: {
      className: term.energyRecoverySpot.className,
      icon: term.energyRecoverySpot.icon,
      title: `${term.energyRecoverySpot.name}（到達するとエネルギー補給、在庫が尽きるまで複数回）`,
    },
  },
}

/** アイテムの表示情報（className・アイコン・hover 説明文言）を解決する */
export const getItemPresentation = (item: ItemInstance): ItemPresentation =>
  item.stock !== undefined
    ? ITEM_PRESENTATIONS[item.kind].spot
    : ITEM_PRESENTATIONS[item.kind].item
