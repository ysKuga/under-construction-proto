import { defineAction } from '../define-action'

import {
  ACTION_FALL,
  FALL_DEFAULTS,
  type FallConfig,
  type FallOverride,
} from './config'
import { useFall } from './use-fall'

export * from './config'

/**
 * 転倒 → 横倒しで静止 → 起き上がり action
 *
 * - 1 回の dispatch で姿勢をトグルする。直立なら転倒、横倒しなら起き上がり
 * - 継続時間・角度は `config.ts` の定数で固定。表示領域ずらし距離 (`shiftDistance`) のみ
 *   `FALL_DEFAULTS` を下地に `actionConfig.fall` / dispatch 引数で上書きできる。\
 *   ずらす向きは倒れ始めの facing から算出する
 */
export const fallAction = defineAction<'fall', FallOverride, FallConfig>({
  defaults: FALL_DEFAULTS,
  event: ACTION_FALL,
  name: 'fall',
  use: useFall,
})
