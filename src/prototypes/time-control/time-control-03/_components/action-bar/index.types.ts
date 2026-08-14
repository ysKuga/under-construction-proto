import { ProgressMode } from '../../types'

export type UseActionBarReturn = {
  /** 行動決定実行 */
  dispatchDecision: () => void
  /** 進行モード (auto/manual) */
  progressMode: ProgressMode
  /** 全 store reset */
  resetAll: () => void
  /** 進行モード全 actor 一括切替 */
  toggleProgressMode: () => void
}
