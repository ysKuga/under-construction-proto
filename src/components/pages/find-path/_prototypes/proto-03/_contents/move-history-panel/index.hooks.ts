import { useMemo } from 'react'

import { useMoveHistoryStore } from '../../_stores/move-history'
import { MoveHistoryEntry } from '../../_stores/move-history/types'

import { MoveHistoryRow, UseMoveHistoryPanelReturn } from './index.types'

/** 履歴一覧に表示する件数の上限（全件の DOM 描画を避ける） */
export const MOVE_HISTORY_DISPLAY_LIMIT = 20

/**
 * 履歴から手数と表示用の一覧を組み立てる
 *
 * @param entries 手数の履歴（古い順）
 */
export const toMoveHistoryView = (
  entries: MoveHistoryEntry[],
): UseMoveHistoryPanelReturn => {
  /** 手数 */
  let moveCount = 0
  const rows = entries.map((entry, index): MoveHistoryRow => {
    // リセット: 手数に数えない
    if (entry.kind === 'reset') {
      return { key: index, label: 'リセット' }
    }

    moveCount += 1

    /** その手の移動先 */
    const destination = entry.path.at(-1)

    return {
      key: index,
      label: `${moveCount}手目: (${destination?.q}, ${destination?.r}) へ ${entry.path.length} マス`,
    }
  })

  return {
    moveCount,
    rows: rows.slice(-MOVE_HISTORY_DISPLAY_LIMIT).reverse(),
  }
}

/**
 * 手数の履歴を購読し、表示用に組み立てる
 *
 * - 履歴の追記で再レンダリングされるのは本パネルのみ
 */
export const useMoveHistoryPanel = (): UseMoveHistoryPanelReturn => {
  const entries = useMoveHistoryStore((state) => state.entries)

  return useMemo(() => toMoveHistoryView(entries), [entries])
}
