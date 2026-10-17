'use client'

import { Settings } from 'lucide-react'

import { StageSliders } from './_contents/stage-sliders'

/** ポップオーバーの id（設定アイコンの `popoverTarget` から参照） */
const POPOVER_ID = 'expedition-stage-settings'

/**
 * 設定アイコンと、クリックで開く調整スライダーのポップオーバー
 *
 * - HTML の Popover API で開閉する（開閉 state・外側クリック・Esc の処理なし）
 * - CSS anchor positioning でアイコンの下・左端揃えに置く（マスの情報パネルに重なる）
 * - 閉じても DOM は残るため、スライダーの値（tilt の `defaultValue` 含む）を保つ
 */
export const StageSettings = () => (
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
      popover="auto"
    >
      <StageSliders />
    </div>
  </>
)
