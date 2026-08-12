import { BASE_TICK_MS } from '../../../time-control-02/_lib/get-tick-ms'

import { ActorInfo } from './types'

/** actor の情報未設定時のデフォルト値 (tickRate は tickMs=100 相当) */
export const DEFAULT_ACTOR_INFO: ActorInfo = {
  speed: 0.01,
  tickRate: BASE_TICK_MS / 100,
}
