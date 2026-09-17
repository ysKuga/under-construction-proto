import { defineAction } from '../define-action'

import {
  ACTION_ENERGY_OUT,
  ENERGY_OUT_DEFAULTS,
  type EnergyOutConfig,
  type EnergyOutOverride,
} from './config'
import { useEnergyOut } from './use-energy-out'

export * from './config'

/**
 * EN 切れ → へたり込み → 復帰 action
 *
 * - 1 回の dispatch で状態をトグルする。通常時ならへたり込み、へたり込み静止中なら復帰
 * - 腕を力なく下げる + 体を縮める(squash)のみで表現する。fall(転倒)とは別軌道
 */
export const energyOutAction = defineAction<
  'energyOut',
  EnergyOutOverride,
  EnergyOutConfig
>({
  defaults: ENERGY_OUT_DEFAULTS,
  event: ACTION_ENERGY_OUT,
  name: 'energyOut',
  use: useEnergyOut,
})
