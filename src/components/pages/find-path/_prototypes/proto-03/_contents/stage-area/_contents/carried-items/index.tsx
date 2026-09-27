'use client'

import { ITEM_KINDS } from '../../../../_stores/items/constants'

import { CarriedItemButton } from './_contents/carried-item-button'

/**
 * 携行アイテムの使用ボタンを種類ごとに並べる（issue #281）
 *
 * - 種類ごとに表示・携行数・使用対象を分け、異なる種類のアイテムが混ざらないようにする
 */
export const CarriedItems = () => (
  <div className="flex gap-3">
    {ITEM_KINDS.map((kind) => (
      <CarriedItemButton key={kind} kind={kind} />
    ))}
  </div>
)
