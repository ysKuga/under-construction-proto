'use client'

import { useMoveHistoryPanel } from './index.hooks'

/**
 * 手数の履歴を表示するパネル（issue #315）
 *
 * - 手数（リセットをまたいだ通算）と、直近の履歴を新しい順に一覧表示する
 * - 高さは固定し（ページの flex で縮めない）、パネル内でスクロールする（追記でレイアウトをずらさない）
 */
export const MoveHistoryPanel = () => {
  const { moveCount, rows } = useMoveHistoryPanel()

  return (
    <aside
      aria-label="手数の履歴"
      className="h-28 w-80 shrink-0 overflow-y-auto rounded border border-gray-300 bg-white p-3 text-sm"
    >
      <p className="mb-2 font-bold">手数: {moveCount}</p>
      <ol className="flex flex-col gap-1">
        {rows.map((row) => (
          <li key={row.key}>{row.label}</li>
        ))}
      </ol>
    </aside>
  )
}
