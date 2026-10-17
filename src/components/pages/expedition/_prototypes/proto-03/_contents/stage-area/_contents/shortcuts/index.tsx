'use client'

import { ITEM_KINDS } from '../../../../_stores/items/constants'

import { CarriedItemButton } from './_contents/carried-item-button'

/**
 * 状態表示の bot に重ねるショートカット群
 *
 * - 操作パネル等を経由せず、状態表示から直接行える操作を左寄せの横並びで置く。同様の要素はここへ追加する
 * - 携行アイテムの使用ボタンを種類ごとに並べる（issue #281）。種類ごとに表示・携行数・使用対象を分け、
 *   異なる種類のアイテムが混ざらないようにする
 */
export const Shortcuts = () => (
  <div className="flex items-end gap-2">
    {ITEM_KINDS.map((kind) => (
      <CarriedItemButton key={kind} kind={kind} />
    ))}
  </div>
)
