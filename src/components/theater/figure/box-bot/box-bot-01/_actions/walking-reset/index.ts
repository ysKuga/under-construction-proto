import { defineAction } from '../define-action'

import { ACTION_WALKING_RESET } from './config'
import { useWalkingReset } from './use-walking-reset'

export * from './config'

/**
 * 歩行の腕・脚を規定位置(0)へ戻す action
 *
 * - `walking` の自然減衰(`settleRate`)を待たず、dispatch 時点の角度から 0 へ、\
 *   引数に渡した `durationMs` かけて線形補間する(省略時 or `0` 以下は即座にスナップ)
 * - `walking` action と対で使う想定(単独 dispatch では `walking` 側の内部状態は\
 *   リセットされず、同じフレームで元の角度から書き戻してしまう)
 */
export const walkingResetAction = defineAction<'walkingReset', number, never>({
  event: ACTION_WALKING_RESET,
  name: 'walkingReset',
  use: useWalkingReset,
})
