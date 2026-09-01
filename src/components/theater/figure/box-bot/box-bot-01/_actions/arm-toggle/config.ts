/** arm-toggle action の発火イベント名 (外部 dispatch から左右の腕を上げ下げトグル) */
export const ACTION_ARM_TOGGLE = 'BoxBot-action-arm-toggle'

/** トグル対象の腕 */
export type ArmSide = 'both' | 'left' | 'right'

/** 腕の上げ下げの設定 */
export type ArmToggleConfig = {
  /** `approach` の減衰係数 (大きいほど速く目標角へ寄る) */
  approachRate: number
  /** 下げ位置からの持ち上げ角 (rad、肩を支点にした z 軸回転の絶対量) */
  upDelta: number
}

/**
 * 腕トグル 1 回ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().armToggle(...)`)時に指定する
 * - `side` 省略時は `'both'`
 */
export type ArmToggleOverride = {
  /** どの腕をトグルするか。省略時は両腕 */
  side?: ArmSide
}

/** `host.config`(arm-toggle)の既定値。`actionConfig.armToggle` で部分上書きできる */
export const ARM_TOGGLE_DEFAULTS: ArmToggleConfig = {
  approachRate: 9,
  upDelta: 1.75,
}
