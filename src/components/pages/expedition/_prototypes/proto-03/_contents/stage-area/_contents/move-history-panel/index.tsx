'use client'

import { useMoveHistoryPanel } from './index.hooks'

/**
 * 手数の履歴を表示するパネル（issue #315）
 *
 * - 手数（リセットをまたいだ通算）と、直近の履歴を新しい順に一覧表示する
 * - 高さは並べる側に合わせ、中身が溢れたらパネル内でスクロールする（追記でレイアウトをずらさない）
 *   - 中身を `absolute` で重ね、パネルの高さに中身の量を反映させない
 */
export const MoveHistoryPanel = () => {
  const { moveCount, rows } = useMoveHistoryPanel()

  return (
    <aside
      aria-label="手数の履歴"
      className="relative w-64 rounded border border-gray-300 bg-white text-sm"
    >
      <div className="absolute inset-0 overflow-y-auto p-3">
        <p className="mb-2 font-bold">手数: {moveCount}</p>
        <ol className="flex flex-col gap-1">
          {rows.map((row) => (
            <li key={row.key}>{row.label}</li>
          ))}
        </ol>
      </div>
    </aside>
  )
}
