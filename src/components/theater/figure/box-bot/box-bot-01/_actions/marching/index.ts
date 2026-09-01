import { defineAction } from '../define-action'

import {
  ACTION_MARCHING,
  MARCHING_DEFAULTS,
  type MarchingConfig,
} from './config'
import { useMarching } from './use-marching'

export * from './config'

/**
 * 足踏み(脚の上下 bob)on/off トグル action
 *
 * - 1 回の dispatch で足踏みを on/off する。倒れ姿勢中(`readPosture() !== 0`)はトグル無効
 * - 振幅・周期は `MARCHING_DEFAULTS` を下地に `actionConfig.marching` で上書き
 * - walking と脚グループを共有するが軸が別(marching = position.y、walking = rotation.x)
 */
export const marchingAction = defineAction<'marching', never, MarchingConfig>({
  defaults: MARCHING_DEFAULTS,
  event: ACTION_MARCHING,
  name: 'marching',
  use: useMarching,
})
