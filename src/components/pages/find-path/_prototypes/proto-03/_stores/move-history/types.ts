import { StoreApi } from 'zustand/vanilla'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

/**
 * 手数の履歴を保持する store
 *
 * - 1 手 = 経路の実行 1 回、または隣接セルへの直接移動 1 回
 * - 盤面リセット（`ResetProvider`）の再マウント対象の外に置き、リセットをまたいで通算する
 * - seed 変更（再生成）時は `StageSeedProvider` 配下ごと再マウントされ、破棄される
 * - 上限（`MOVE_HISTORY_LIMIT`）を超えたら古い順に捨てる
 */
export type MoveHistoryState = {
  /** 記録した手（古い順）。各要素はその手で移動した経路 */
  moves: HexCell[][]
  /**
   * 1 手を記録する
   *
   * @param path その手で移動した経路
   */
  record: (path: HexCell[]) => void
}

export type MoveHistoryStore = StoreApi<MoveHistoryState>
