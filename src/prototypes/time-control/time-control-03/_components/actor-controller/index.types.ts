import { ActorId, Position } from '../../types'

export type ActorControllerProps = {
  /** 表示対象の actor */
  id: ActorId
}

export type UseActorControllerReturn = {
  /** target 企図実行 (現在位置からランダムオフセット) */
  dispatchTarget: () => void
  /** 到達までの残り時間 (ms) */
  etaMs: number
  /** 固定 step 数 */
  fixedPathSteps: number
  /** 現在の企図 (経路の最終要素、経路が空なら企図なし/到達済み) */
  intentTarget: Position | undefined
  /** 固定 step 有効か */
  isFixedPathSteps: boolean
  /** 残り経路 */
  path: Position[]
  /** 現在位置 */
  position: Position
  /** 固定 step 数設定 */
  setFixedPathSteps: (steps: number) => void
  /** 固定 step 有効切替 */
  setIsFixedPathSteps: (checked: boolean) => void
  /** tick 時間設定 */
  setTickMsOption: (value: number) => void
  /** tick 時間 (ms) */
  tickMs: number
}
