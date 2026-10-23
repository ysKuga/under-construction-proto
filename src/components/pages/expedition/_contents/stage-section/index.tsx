'use client'

import { BotStatusPanel } from './_contents/bot-status-panel'
import { CellInfoPanel } from './_contents/cell-info-panel'
import { MoveHistoryPanel } from './_contents/move-history-panel'
import { Stage } from './_contents/stage'

/**
 * ステージと bot の状態表示・マスの情報・手数の履歴を並べる
 *
 * - `md` 未満
 *   - 1 段目: ステージ
 *   - 2 段目: bot の状態表示（正方形）とマスの情報を横並び
 *   - 3 段目: 手数の履歴
 * - `md` 以上
 *   - 1 段目: ステージと bot の状態表示を横並び
 *   - 2 段目: マスの情報
 *   - 3 段目: 手数の履歴
 * - 全体の幅
 *   - `md` 未満: 画面幅（`w-min` だと 2 列にまたがるステージが幅に効かず、マスの情報が縮むため）
 *   - `md` 以上: ステージを含む段の幅（`w-min`）
 * - 段をまたぐ要素は、子を包む要素の `col-span` で指定する（子は配置を持たない）
 * - `md` 未満のマスの情報: 包む要素を `h-0 min-h-full` にし、行の高さへ寄与させず bot の状態表示が決めた高さに合わせる
 *   - `h-full` だけでは中身の量で行が伸び、状態表示が正方形でなくなるため
 */
export const StageSection = () => (
  <div className="grid w-full grid-cols-[auto_1fr] gap-4 md:w-min md:grid-cols-[auto_auto] md:items-center md:gap-x-0">
    <div className="col-span-2 justify-self-center md:col-span-1">
      <Stage />
    </div>
    <BotStatusPanel />
    <div className="h-0 min-h-full md:col-span-2 md:h-auto md:min-h-0">
      <CellInfoPanel />
    </div>
    <div className="col-span-2">
      <MoveHistoryPanel />
    </div>
  </div>
)
