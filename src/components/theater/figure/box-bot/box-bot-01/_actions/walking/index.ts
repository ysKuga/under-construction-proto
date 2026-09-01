import { defineAction } from '../define-action'

import { ACTION_WALKING, WALKING_DEFAULTS, type WalkingConfig } from './config'
import { useWalking } from './use-walking'

export * from './config'

/**
 * 歩行(脚の前後スイング)on/off トグル action
 *
 * - 1 回の dispatch で歩行を on/off する。倒れ姿勢中(`readPosture() !== 0`)はトグル無効
 * - スイング角・周期・加減速は `WALKING_DEFAULTS` を下地に `actionConfig.walking` で上書き
 * - marching と脚グループを共有するが軸が別(walking = rotation.x、marching = position.y)
 */
export const walkingAction = defineAction<'walking', never, WalkingConfig>({
  defaults: WALKING_DEFAULTS,
  event: ACTION_WALKING,
  name: 'walking',
  use: useWalking,
})
