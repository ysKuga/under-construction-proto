export type UseFixedPathStepsControlReturn = {
  /** 固定 step 数 (代表値、先頭 actor の設定) */
  fixedPathSteps: number
  /** 経路の step 数を固定するか (代表値、先頭 actor の設定) */
  isFixedPathSteps: boolean
  /** 対象 actor 一括の固定 step 数を設定する */
  setFixedPathStepsAll: (steps: number) => void
  /** 対象 actor 一括の固定 step 有効/無効を設定する */
  setIsFixedPathStepsAll: (isFixed: boolean) => void
}
