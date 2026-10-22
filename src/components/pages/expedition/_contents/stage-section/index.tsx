'use client'

import { BotStatusPanel } from './_contents/bot-status-panel'
import { CellInfoPanel } from './_contents/cell-info-panel'
import { MoveHistoryPanel } from './_contents/move-history-panel'
import { Stage } from './_contents/stage'

/**
 * ステージと bot の状態表示・マスの情報・手数の履歴を並べる
 *
 * - `md` 未満: ステージ・bot の状態表示（横一列のバー）・マスの情報・手数の履歴を縦に並べる
 * - `md` 以上
 *   - 1 段目: ステージと bot の状態表示を横並び
 *   - 2 段目: マスの情報
 *   - 3 段目: 手数の履歴
 * - 全体の幅
 *   - `md` 未満: 画面幅（`w-min` だとステージが幅に効かず、マスの情報が縮むため）
 *   - `md` 以上: ステージを含む段の幅（`w-min`）
 * - 段をまたぐ要素は、子を包む要素の `col-span` で指定する（子は配置を持たない）
 */
export const StageSection = () => (
  <div className="grid w-full grid-cols-1 gap-4 md:w-min md:grid-cols-[auto_auto] md:items-center md:gap-x-0">
    <div className="justify-self-center">
      <Stage />
    </div>
    <BotStatusPanel />
    <div className="md:col-span-2">
      <CellInfoPanel />
    </div>
    <div className="md:col-span-2">
      <MoveHistoryPanel />
    </div>
  </div>
)
