'use client'

import { FacingIndicator } from './_contents/facing-indicator'
import { FacingSyncToggle } from './_contents/facing-sync-toggle'
import { MoveHistoryPanel } from './_contents/move-history-panel'
import { Shortcuts } from './_contents/shortcuts'
import { Stage } from './_contents/stage'
import { StageSettings } from './_contents/stage-settings'
import { StandaloneBot } from './_contents/standalone-bot'

/**
 * ステージと bot の状態表示・手数の履歴を横に並べる
 *
 * - 手数の履歴は bot の状態表示の横に、状態表示と同じ高さで並べる（`items-stretch`）
 * - bot の状態表示は、独立 bot を上・向きインジケータを下に縦に並べる
 * - 独立 bot の表示領域は設置領域からはみ出すため、重ねる要素・向きインジケータを `z-10` で前面に置く
 * - ステージの右上に設定アイコン（調整スライダーのポップオーバー）を重ねる
 * - 独立 bot の右上に向きの同期・固定の切替ボタンを重ねる
 * - 独立 bot の左下にショートカット群（携行アイテムの使用等）を重ねる
 */
export const StageArea = () => (
  <div className="flex items-center">
    <div className="relative">
      <Stage />
      <div className="absolute right-0 top-0 z-10">
        <StageSettings />
      </div>
    </div>
    <div className="flex items-stretch gap-4">
      <div className="flex flex-col items-center gap-2">
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
      <MoveHistoryPanel />
    </div>
  </div>
)
