import { StoreApi } from 'zustand/vanilla'

/**
 * ゴール到達状況を保持する store
 *
 * - 一度到達したら、ゴールから離れても到達済みのまま（リセットで戻す）
 */
export type GoalState = {
  /** 旗を bot の頭上へ掲げたか。到達後、bot がゴールセルの中心へ着いた時点で立つ */
  flagRaised: boolean
  /** 旗を bot の頭上へ掲げる。未到達なら何もしない */
  raiseFlag: () => void
  /** ゴール到達を記録する */
  reach: () => void
  /** ゴールへ到達済みか */
  reached: boolean
}

export type GoalStore = StoreApi<GoalState>
