'use client'

import { getCarriedItemPresentation } from '../../../../_lib/item-presentation'

import { useCarriedItemButton } from './index.hooks'

/** 携行対象の回復アイテムの表示情報 */
const CARRIED_ITEM_PRESENTATION = getCarriedItemPresentation('energy-recovery')

/**
 * 携行中の回復アイテムを使用するボタン（issue #281）
 *
 * - 丸で囲った回復アイテムを表示し、携行数を右下へ重ねる（丸からのはみ出しは許容）
 * - クリックで1つ使用する。携行数 0 なら disabled
 */
export const CarriedItemButton = () => {
  const { carriedCount, handleClick } = useCarriedItemButton()

  return (
    <button
      aria-label={`回復アイテムを使用（携行: ${carriedCount}）`}
      className="relative flex size-12 items-center justify-center rounded-full border-2 border-gray-400 bg-white text-2xl hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
      disabled={carriedCount === 0}
      onClick={handleClick}
      title="回復アイテムを使用する"
      type="button"
    >
      <span aria-hidden>{CARRIED_ITEM_PRESENTATION.emoji}</span>
      <span
        aria-hidden
        className="absolute -bottom-1 -right-2 text-sm font-bold text-gray-700"
      >
        {carriedCount}
      </span>
    </button>
  )
}
