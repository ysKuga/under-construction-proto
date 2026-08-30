import { defineAction } from '../define-action'

import { ACTION_FALL } from './config'
import { useFall } from './use-fall'

export * from './config'

/**
 * 転倒 → 横倒しで静止 → 起き上がり action
 *
 * - 1 回の dispatch で姿勢をトグルする。直立なら転倒、横倒しなら起き上がり
 * - 設定 (config) は持たない。継続時間・角度は `config.ts` の定数で固定
 */
export const fallAction = defineAction<'fall'>({
  event: ACTION_FALL,
  name: 'fall',
  use: useFall,
})
