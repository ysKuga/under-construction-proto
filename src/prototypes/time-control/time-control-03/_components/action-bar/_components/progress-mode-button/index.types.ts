import { ProgressMode } from '../../../../types'

export type UseProgressModeButtonReturn = {
  /** 進行モード (auto/manual) */
  progressMode: ProgressMode
  /** 進行モード全 actor 一括切替 */
  toggleProgressMode: () => void
}
