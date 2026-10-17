import { StoreApi } from 'zustand/vanilla'

import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

import { ItemKind } from '../_types'

/**
 * 手数の履歴の 1 件
 *
 * - `move`: 1 手。経路の実行 1 回、または隣接セルへの直接移動 1 回
 * - `move` 以外はアクションに伴う結果。手数には数えない
 *   - `reset`: EN 切れ時のチェックポイントへのリセット
 *   - `pick-up-item`: 移動先のアイテムの携行
 *   - `use-item`: 携行アイテムの使用（受理されたもの）
 *   - `use-energy-spot`: EN スポットでの補給（受理されたもの）
 *   - `energy-depleted`: player の EN 切れ
 *   - `reach-goal`: ゴールへの到達（初回のみ）
 */
export type MoveHistoryEntry =
  | {
      kind: 'move'
      /** その手で移動した経路 */
      path: HexCell[]
    }
  | {
      kind: 'reset'
    }
  | {
      /** 携行したアイテムの種類 */
      itemKind: ItemKind
      kind: 'pick-up-item'
    }
  | {
      /** 使用したアイテムの種類 */
      itemKind: ItemKind
      kind: 'use-item'
    }
  | {
      kind: 'use-energy-spot'
    }
  | {
      kind: 'energy-depleted'
    }
  | {
      kind: 'reach-goal'
    }

/**
 * 手数の履歴を保持する store
 *
 * - 盤面リセット（`ResetProvider`）の再マウント対象の外に置き、リセットをまたいで通算する
 * - seed 変更（再生成）時は `StageSeedProvider` 配下ごと再マウントされ、破棄される
 * - 上限（`MOVE_HISTORY_LIMIT`）を超えたら古い順に捨てる
 */
export type MoveHistoryState = {
  /** 履歴（古い順） */
  entries: MoveHistoryEntry[]
  /**
   * 履歴へ 1 件記録する
   *
   * @param entry 記録する項目
   */
  record: (entry: MoveHistoryEntry) => void
}

export type MoveHistoryStore = StoreApi<MoveHistoryState>
