'use client'

import { FacingIndicator } from './_components/facing-indicator'
import { FacingSyncToggle } from './_components/facing-sync-toggle'
import { Shortcuts } from './_components/shortcuts'
import { StandaloneBot } from './_components/standalone-bot'

/**
 * bot の状態表示
 *
 * - 独立 bot を上・向きインジケータを下に縦に並べ、角丸の枠で囲う
 * - 独立 bot の表示領域は設置領域からはみ出すため、重ねる要素・向きインジケータを `z-10` で前面に置く
 * - 独立 bot の右上に向きの同期・固定の切替ボタンを重ねる
 * - 独立 bot の左下にショートカット群（携行アイテムの使用等）を重ねる
 */
export const BotStatusPanel = () => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-300 p-3">
    <div className="relative">
      <StandaloneBot />
      <div className="absolute right-0 top-0 z-10">
        <FacingSyncToggle />
      </div>
      <div className="absolute bottom-0 left-0 z-10">
        <Shortcuts />
      </div>
    </div>
    <div className="relative z-10">
      <FacingIndicator />
    </div>
  </div>
)
