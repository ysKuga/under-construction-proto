'use client'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import {
  STANDALONE_BOT_ACTION_CONFIG,
  STANDALONE_BOT_ACTIONS,
} from './index.constants'
import { useStandaloneBot } from './index.hooks'

/**
 * ステージ上の bot とは別に独立表示し、歩行・EN 切れを同期する bot（issue #248）
 *
 * - `interactive` は既定(true)のままにする。false だと walking・energyOut 等の action が
 *   dispatch を無視し、同期されない
 * - クリック(既定の `clickBindings` = jump/spin)は `actions` に含めないため反応しない
 *   （ステージ上の bot と同じ）
 * - 大きさは画面幅で切り替える（`useStandaloneBotSize`）
 */
export const StandaloneBot = () => {
  const { canvasHeight, standaloneBotEventTarget, standaloneBotSize } =
    useStandaloneBot()

  return (
    <BoxBot01
      actionConfig={STANDALONE_BOT_ACTION_CONFIG}
      actions={STANDALONE_BOT_ACTIONS}
      canvasHeight={canvasHeight}
      eventTarget={standaloneBotEventTarget}
      orbit={false}
      style={{ height: standaloneBotSize, width: standaloneBotSize }}
    />
  )
}
