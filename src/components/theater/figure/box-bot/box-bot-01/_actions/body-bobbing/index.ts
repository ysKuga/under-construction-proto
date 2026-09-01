import { defineAction } from '../define-action'

import {
  ACTION_BODY_BOBBING,
  BODY_BOBBING_DEFAULTS,
  type BodyBobbingConfig,
} from './config'
import { useBodyBobbing } from './use-body-bobbing'

export * from './config'

/**
 * walking / marching 中に体を上下させる action
 *
 * - dispatch で on/off しない。登録されていれば walking / marching に常時連動する。\
 *   無効化は `actions` 配列から外す
 * - 最大持ち上げ量・正規化基準は `BODY_BOBBING_DEFAULTS` を下地に `actionConfig.bodyBobbing` で上書き
 */
export const bodyBobbingAction = defineAction<
  'bodyBobbing',
  never,
  BodyBobbingConfig
>({
  defaults: BODY_BOBBING_DEFAULTS,
  event: ACTION_BODY_BOBBING,
  name: 'bodyBobbing',
  use: useBodyBobbing,
})
