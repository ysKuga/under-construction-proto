import { ProgressMode } from '../../types'

export type UseActionBarReturn = {
  /** async listener 実演用サンプルイベント発行 */
  dispatchAsyncSample: () => void
  /** 行動決定実行 */
  dispatchDecision: () => void
  /** 進行モード (auto/manual) */
  progressMode: ProgressMode
  /** 全 store reset */
  resetAll: () => void
  /** 進行モード全 actor 一括切替 */
  toggleProgressMode: () => void
}
