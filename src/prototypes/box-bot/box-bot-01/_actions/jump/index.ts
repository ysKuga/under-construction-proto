import { defineAction } from '../define-action'

import {
  ACTION_JUMP,
  JUMP_DEFAULTS,
  type JumpConfig,
  type JumpOverride,
} from './config'
import { useJump } from './use-jump'

export * from './config'

/**
 * ジャンプ(単発 jump / 待機 hopping 共通)action
 *
 * - 進行度・解決済みパラメータの ref、squash 定数、イベント名、既定値まで
 *   このフォルダ配下に集約している
 * - 設定 (`liftPx` / `durSec`) は `JUMP_DEFAULTS` を下地に `actionConfig.jump` で上書き
 */
export const jumpAction = defineAction<'jump', JumpOverride, JumpConfig>({
  defaults: JUMP_DEFAULTS,
  event: ACTION_JUMP,
  name: 'jump',
  use: useJump,
})
