import { useMemo } from 'react'
import { match } from 'ts-pattern'

import { term } from '@/features/term-registry'

import { getCarriedItemPresentation } from '../../../../_lib/item-presentation'

import { useMoveHistoryStore } from '../../../../_stores/move-history'
import { MoveHistoryEntry } from '../../../../_stores/move-history/types'

import { MoveHistoryRow, UseMoveHistoryPanelReturn } from './index.types'

/** 履歴一覧に表示する件数の上限（全件の DOM 描画を避ける） */
export const MOVE_HISTORY_DISPLAY_LIMIT = 20

/**
 * 手数に数えない項目（アクションの結果）の表示文言
 *
 * @param entry 履歴の 1 件（`move` 以外）
 */
const describeAction = (
  entry: Exclude<MoveHistoryEntry, { kind: 'move' }>,
): string =>
  match(entry)
    .with({ kind: 'reset' }, () => 'リセット')
    .with(
      { kind: 'pick-up-item' },
      ({ itemKind }) => `${getCarriedItemPresentation(itemKind).name}を携行`,
    )
    .with(
      { kind: 'use-item' },
      ({ itemKind }) => `${getCarriedItemPresentation(itemKind).name}を使用`,
    )
    .with(
      { kind: 'use-energy-spot' },
      () => `${term.energyChargeSpot.name}で補給`,
    )
    .with({ kind: 'energy-depleted' }, () => 'EN 切れ')
    .with({ kind: 'reach-goal' }, () => 'ゴール到達')
    .exhaustive()

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
    // アクションの結果: 手数に数えない
    if (entry.kind !== 'move') {
      return { key: index, label: describeAction(entry) }
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
