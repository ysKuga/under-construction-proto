'use client'

import { FacingIndicator } from './_components/facing-indicator'
import { FacingSyncToggle } from './_components/facing-sync-toggle'
import { Shortcuts } from './_components/shortcuts'
import { StandaloneBot } from './_components/standalone-bot'

/**
 * bot の状態表示
 *
 * - 角丸の枠で囲う
 * - `md` 未満: 独立 bot・向きインジケータ・ショートカット群を横一列に並べる（issue #393）
 *   - 独立 bot を包む要素を `contents` にし、ショートカット群を `order-last` で末尾へ回す
 *   - 向きの同期・固定の切替ボタンは表示しない
 * - `md` 以上: 独立 bot を上・向きインジケータを下に縦に並べる
 *   - 独立 bot の右上に向きの同期・固定の切替ボタンを重ねる
 *   - 独立 bot の左下にショートカット群（携行アイテムの使用等）を重ねる
 * - 独立 bot の表示領域は設置領域からはみ出すため、重ねる要素・向きインジケータを `z-10` で前面に置く
 */
export const BotStatusPanel = () => (
  <div className="flex items-center justify-center gap-4 rounded-xl border border-gray-300 p-3 md:flex-col md:gap-2">
    <div className="contents md:relative md:block">
      <StandaloneBot />
      <div className="absolute right-0 top-0 z-10 hidden md:block">
        <FacingSyncToggle />
      </div>
      <div className="relative z-10 order-last md:absolute md:bottom-0 md:left-0">
        <Shortcuts />
      </div>
    </div>
    <div className="relative z-10">
      <FacingIndicator />
    </div>
  </div>
)
