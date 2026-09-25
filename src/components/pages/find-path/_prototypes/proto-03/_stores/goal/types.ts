import { StoreApi } from 'zustand/vanilla'

/**
 * ゴール到達状況を保持する store
 *
 * - 一度到達したら、ゴールから離れても到達済みのまま（リセットで戻す）
 */
export type GoalState = {
  /** ゴール到達を記録する */
  reach: () => void
  /** ゴールへ到達済みか */
  reached: boolean
}

export type GoalStore = StoreApi<GoalState>
