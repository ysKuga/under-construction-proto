'use client'

import { FacingIndicator } from './_components/facing-indicator'
import { FacingSyncToggle } from './_components/facing-sync-toggle'
import { Shortcuts } from './_components/shortcuts'
import { StandaloneBot } from './_components/standalone-bot'

/**
 * bot の状態表示
 *
 * - 角丸の枠で囲う
 * - `md` 未満: 独立 bot のみを枠に収め、向きインジケータを左上・ショートカット群を右下に重ねる（issue #393）
 *   - 枠を正方形（独立 bot 64px + 余白）にし、マスの情報と横並びにする
 *   - 向きの同期・固定の切替ボタンは表示しない
 * - `md` 以上: 独立 bot を上・向きインジケータを下に縦に並べる
 *   - 独立 bot の右上に向きの同期・固定の切替ボタンを重ねる
 *   - 独立 bot の左下にショートカット群（携行アイテムの使用等）を重ねる
 * - 重ねる要素の基準
 *   - `md` 未満: 枠（独立 bot を包む要素は `relative` を持たない）
 *   - `md` 以上: 独立 bot を包む要素
 * - 独立 bot の表示領域は設置領域からはみ出すため、重ねる要素・向きインジケータを `z-10` で前面に置く
 */
export const BotStatusPanel = () => (
  <div className="relative flex flex-col items-center gap-2 rounded-xl border border-gray-300 p-3">
    <div className="md:relative">
      <StandaloneBot />
      <div className="absolute right-0 top-0 z-10 hidden md:block">
        <FacingSyncToggle />
      </div>
      <div className="absolute bottom-1 right-1 z-10 md:bottom-0 md:left-0 md:right-auto">
        <Shortcuts />
      </div>
    </div>
    <div className="absolute left-1 top-1 z-10 md:relative md:left-auto md:top-auto">
      <FacingIndicator />
    </div>
  </div>
)
