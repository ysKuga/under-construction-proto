import { defineAction } from '../define-action'

import { ACTION_HOPPING, HOPPING_DEFAULTS, type HoppingConfig } from './config'
import { useHopping } from './use-hopping'

export * from './config'

/**
 * 待機演出(連続ジャンプ)on/off トグル action
 *
 * - 1 回の dispatch で on/off する。倒れ姿勢中(`readPosture() !== 0`)はトグル無効
 * - active 中は `intervalSec` ごとに `ACTION_JUMP` を dispatch し、jump action の見た目を
 *   再利用する(jump 側が実行中の重複を弾く)
 * - 間隔は `HOPPING_DEFAULTS` を下地に `actionConfig.hopping` で上書き
 */
export const hoppingAction = defineAction<'hopping', never, HoppingConfig>({
  defaults: HOPPING_DEFAULTS,
  event: ACTION_HOPPING,
  name: 'hopping',
  use: useHopping,
})
