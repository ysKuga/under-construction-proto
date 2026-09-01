import { defineAction } from '../define-action'

import {
  ACTION_AUTO_ROTATE,
  AUTO_ROTATE_DEFAULTS,
  type AutoRotateConfig,
  type AutoRotateOverride,
} from './config'
import { useAutoRotate } from './use-auto-rotate'

export * from './config'

/**
 * 自動回転(on/off トグル)action
 *
 * - 1 回の dispatch で回転を on/off する。on の間は毎フレーム yaw を進める
 * - 角速度 (`speed`) は `AUTO_ROTATE_DEFAULTS` を下地に `actionConfig.autoRotate` /
 *   dispatch 引数で上書きできる
 */
export const autoRotateAction = defineAction<
  'autoRotate',
  AutoRotateOverride,
  AutoRotateConfig
>({
  defaults: AUTO_ROTATE_DEFAULTS,
  event: ACTION_AUTO_ROTATE,
  name: 'autoRotate',
  use: useAutoRotate,
})
