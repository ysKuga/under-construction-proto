export type UseActionBarReturn = {
  /** 行動決定実行 */
  dispatchDecision: () => void
  /** 対象 actor 一括の target 企図実行 */
  dispatchTargetAll: () => void
  /** 全 store reset */
  resetAll: () => void
}
