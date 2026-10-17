import { StoreApi } from 'zustand/vanilla'

/**
 * tick 実行状態を保持する store
 *
 * - `useFindPathTick` が走行中か・ゴール到達済みかを保持する。`FindPathContent`
 *   の `useState` に持たせると値変更のたび配下ツリー全体（`Stage06` 含む）が
 *   再レンダリングされるため、選択購読可能な store へ分離した（issue #137
 *   design.md 懸念・リスク）
 */
export type TickStatusState = {
  /** tick 走行中か */
  isRunning: boolean
  /** bot が GOAL_POSITION に到達済みか */
  reachedGoal: boolean
  /** tick 走行中かを更新する */
  setIsRunning: (isRunning: boolean) => void
  /** ゴール到達済みかを更新する */
  setReachedGoal: (reachedGoal: boolean) => void
}

export type TickStatusStore = StoreApi<TickStatusState>
