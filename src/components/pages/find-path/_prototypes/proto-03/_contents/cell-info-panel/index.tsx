'use client'

import { useCellInfoPanel } from './index.hooks'

/**
 * hover 中マスの内包要素を一覧表示するパネル（issue #137、PR #313）
 *
 * - ステージ外へ固定サイズで置く。要素が多い場合はパネル内でスクロールする
 * - `Stage07-cell-hover` を自身で購読する。hover で再レンダリングされるのは本パネルのみ
 * - 移動中（`interactive=false`）は hover 通知が来ないため更新されない
 */
export const CellInfoPanel = () => {
  const { entries, hint, hoveredCell } = useCellInfoPanel()

  return (
    <aside
      aria-label="マスの情報"
      className="fixed right-4 top-4 h-48 w-72 overflow-y-auto rounded border border-gray-300 bg-white p-3 text-sm shadow"
    >
      {!hoveredCell ? (
        <p className="text-gray-500">マスにカーソルを合わせると内容を表示</p>
      ) : (
        <>
          {hint && <p className="mb-2 text-blue-700">{hint}</p>}
          {entries.length === 0 ? (
            <p className="text-gray-500">何もないマス</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {entries.map((entry) => (
                <li className="flex gap-2" key={entry.key}>
                  <span aria-hidden>{entry.icon}</span>
                  <span>
                    {entry.description}
                    {entry.status && (
                      <span className="ml-1 text-gray-600">{entry.status}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  )
}
