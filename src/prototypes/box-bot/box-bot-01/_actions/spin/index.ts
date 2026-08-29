import { defineAction } from '../define-action'

import {
  ACTION_SPIN,
  SPIN_DEFAULTS,
  type SpinConfig,
  type SpinOverride,
} from './config'
import { useSpin } from './use-spin'

export * from './config'

/**
 * 単発スピン(加速 → 最大速度維持 → 減速 → 停止)action
 *
 * - 進行度・解決済みパラメータの ref、イベント名、既定値までこのフォルダ配下に集約している
 * - 設定 (`accelSec` / `holdSec` / `decelSec` / `maxSpeed`) は `SPIN_DEFAULTS` を下地に
 *   `actionConfig.spin` で上書き
 */
export const spinAction = defineAction<'spin', SpinOverride, SpinConfig>({
  defaults: SPIN_DEFAULTS,
  event: ACTION_SPIN,
  name: 'spin',
  use: useSpin,
})
