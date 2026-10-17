'use client'

import { CellInfoPanel } from './_contents/cell-info-panel'
import { FacingIndicator } from './_contents/facing-indicator'
import { FacingSyncToggle } from './_contents/facing-sync-toggle'
import { MoveHistoryPanel } from './_contents/move-history-panel'
import { Shortcuts } from './_contents/shortcuts'
import { Stage } from './_contents/stage'
import { StandaloneBot } from './_contents/standalone-bot'

/**
 * ステージと bot の状態表示・マスの情報・手数の履歴を並べる
 *
 * - 1 段目: ステージと bot の状態表示を横に並べる
 * - 2 段目: マスの情報
 * - 3 段目: 手数の履歴
 * - 2・3 段目は 1 段目の幅に合わせる（`w-min` で 1 段目の幅を全体の幅にする）
 * - bot の状態表示は、独立 bot を上・向きインジケータを下に縦に並べ、角丸の枠で囲う
 * - 独立 bot の表示領域は設置領域からはみ出すため、重ねる要素・向きインジケータを `z-10` で前面に置く
 * - 独立 bot の右上に向きの同期・固定の切替ボタンを重ねる
 * - 独立 bot の左下にショートカット群（携行アイテムの使用等）を重ねる
 */
export const StageArea = () => (
  <div className="flex w-min flex-col gap-4">
    <div className="flex items-center">
      <Stage />
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
    </div>
    <CellInfoPanel />
    <MoveHistoryPanel />
  </div>
)
