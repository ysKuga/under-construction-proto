'use client'

import { getCarriedItemPresentation } from '../../../../../../_lib/item-presentation'

import { CarriedItemButtonProps, useCarriedItemButton } from './index.hooks'

/**
 * 携行中のアイテムを種類単位で使用するボタン（issue #281）
 *
 * - 丸で囲った対象種類のアイテムを表示し、その種類の携行数を右下へ重ねる（丸からのはみ出しは許容）
 * - クリックで対象種類のアイテムを1つ使用する。携行数 0 なら disabled
 */
export const CarriedItemButton = (props: CarriedItemButtonProps) => {
  const { carriedCount, handleClick } = useCarriedItemButton(props)
  /** 対象種類の表示情報 */
  const presentation = getCarriedItemPresentation(props.kind)

  return (
    <button
      aria-label={`${presentation.title}を使用（携行: ${carriedCount}）`}
      className="relative flex size-12 items-center justify-center rounded-full border-2 border-gray-400 bg-white text-2xl hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
      disabled={carriedCount === 0}
      onClick={handleClick}
      title={presentation.title}
      type="button"
    >
      <span aria-hidden>{presentation.emoji}</span>
      <span
        aria-hidden
        className="absolute -bottom-1 -right-2 text-sm font-bold text-gray-700"
      >
        {carriedCount}
      </span>
    </button>
  )
}
