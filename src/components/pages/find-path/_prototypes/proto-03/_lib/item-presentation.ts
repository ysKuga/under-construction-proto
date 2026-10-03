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
 * - `item`: 携行アイテム相当（`stock` 未指定）。`spot`: 据置スポット相当
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
      className: term.energyRecoveryItem.className,
      icon: term.energyRecoveryItem.icon,
      title: `${term.energyRecoveryItem.name}（踏むと携行、使用するとエネルギー補給、1個限り）`,
    },
    spot: {
      className: term.energyRecoverySpot.className,
      icon: term.energyRecoverySpot.icon,
      title: `${term.energyRecoverySpot.name}（停止中に使用するとエネルギー補給、残量が尽きるまで）`,
    },
  },
}

/**
 * 携行アイテムの表示情報を種類から解決する
 *
 * @param kind アイテムの種類
 */
export const getCarriedItemPresentation = (kind: ItemKind): ItemPresentation =>
  ITEM_PRESENTATIONS[kind].item

/** アイテムの表示情報（className・アイコン・hover 説明文言）を解決する */
export const getItemPresentation = (item: ItemInstance): ItemPresentation =>
  item.stock !== undefined
    ? ITEM_PRESENTATIONS[item.kind].spot
    : ITEM_PRESENTATIONS[item.kind].item
