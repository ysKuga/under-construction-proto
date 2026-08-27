import { defineAction } from '../types'

import { ACTION_JUMP, type JumpOverride } from './config'
import { useJump } from './use-jump'

export * from './config'

/**
 * ジャンプ(単発 jump / 待機 hopping 共通)action
 *
 * - 進行度・解決済みパラメータの ref、squash 定数、イベント名、既定値まで
 *   このフォルダ配下に集約している
 */
export const jumpAction = defineAction<'jump', JumpOverride>({
  event: ACTION_JUMP,
  name: 'jump',
  use: useJump,
})
