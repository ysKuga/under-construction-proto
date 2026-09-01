import { defineAction } from '../define-action'

import {
  ACTION_ARM_TOGGLE,
  ARM_TOGGLE_DEFAULTS,
  type ArmToggleConfig,
  type ArmToggleOverride,
} from './config'
import { useArmToggle } from './use-arm-toggle'

export * from './config'

/**
 * 左右の腕の上げ下げ toggle action
 *
 * - 1 回の dispatch で `side`(既定 `'both'`)の腕の上げ下げをトグルする
 * - 持ち上げ角・補間速度は `ARM_TOGGLE_DEFAULTS` を下地に `actionConfig.armToggle` で上書き
 * - fall と腕グループを共有するが軸が別(arm-toggle = z、fall = x)
 */
export const armToggleAction = defineAction<
  'armToggle',
  ArmToggleOverride,
  ArmToggleConfig
>({
  defaults: ARM_TOGGLE_DEFAULTS,
  event: ACTION_ARM_TOGGLE,
  name: 'armToggle',
  use: useArmToggle,
})
