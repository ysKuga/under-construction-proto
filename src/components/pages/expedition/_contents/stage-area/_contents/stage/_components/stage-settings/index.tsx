'use client'

import { Pin, PinOff, Settings } from 'lucide-react'

import { StageSliders } from './_components/stage-sliders'
import { useStageSettings } from './index.hooks'

/** ポップオーバーの id（設定アイコンの `popoverTarget` から参照） */
const POPOVER_ID = 'expedition-stage-settings'

/**
 * 設定アイコンと、クリックで開く調整スライダーのポップオーバー
 *
 * - HTML の Popover API で開閉する（開閉 state・外側クリック・Esc の処理なし）
 * - CSS anchor positioning でアイコンの下・左端揃えに置く（マスの情報パネルに重なる）
 * - 閉じても DOM は残るため、スライダーの値（tilt の `defaultValue` 含む）を保つ
 * - ピン留め中は `popover="manual"` にし、外側クリック・Esc で閉じない。解除で閉じる
 */
export const StageSettings = () => {
  const { handlePinClick, pinned, popoverRef } = useStageSettings()
  /** ピン留めボタンのアイコン（クリックで変更される先） */
  const PinIcon = pinned ? PinOff : Pin

  return (
    <>
      <button
        aria-label="設定"
        className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-600 [anchor-name:--expedition-stage-settings] hover:bg-gray-100"
        popoverTarget={POPOVER_ID}
        title="設定"
        type="button"
      >
        <Settings size={16} />
      </button>
      <div
        className="m-0 mt-1 rounded border border-gray-300 bg-white p-3 shadow [position-anchor:--expedition-stage-settings] [position-area:bottom_span-right]"
        id={POPOVER_ID}
        popover={pinned ? 'manual' : 'auto'}
        ref={popoverRef}
      >
        <button
          aria-label="ピン留め"
          aria-pressed={pinned}
          className="absolute right-2 top-2 rounded p-1 text-gray-600 hover:bg-gray-100"
          onClick={handlePinClick}
          title={pinned ? 'ピン留めを外す' : 'ピン留めする'}
          type="button"
        >
          <PinIcon size={14} />
        </button>
        <StageSliders />
      </div>
    </>
  )
}
