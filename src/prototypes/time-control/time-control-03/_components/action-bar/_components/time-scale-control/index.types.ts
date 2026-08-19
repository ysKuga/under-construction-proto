export type UseTimeScaleControlReturn = {
  /** 進行倍率を設定する (0 でポーズ相当) */
  setTimeScale: (timeScale: number) => void
  /** 実時間に対するゲーム内時間の進行倍率 */
  timeScale: number
}
