'use client'

import { CellInfoPanel } from './_contents/cell-info-panel'
import { MoveHistoryPanel } from './_contents/move-history-panel'
import { StageGroup } from './_contents/stage-group'

/**
 * ステージと bot の状態表示・マスの情報・手数の履歴を並べる
 *
 * - 1 段目: ステージと bot の状態表示
 * - 2 段目: マスの情報
 * - 3 段目: 手数の履歴
 * - 2・3 段目は 1 段目の幅に合わせる（`w-min` で 1 段目の幅を全体の幅にする）
 */
export const StageSection = () => (
  <div className="flex w-min flex-col gap-4">
    <StageGroup />
    <CellInfoPanel />
    <MoveHistoryPanel />
  </div>
)
