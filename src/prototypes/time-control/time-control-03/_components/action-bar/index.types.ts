import { ActorId, ProgressMode } from '../../types'

export type ActionBarProps = {
  /** 操作対象の actor 一覧 */
  actorIds: ActorId[]
}

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
