'use client'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import {
  STANDALONE_BOT_ACTIONS,
  useStandaloneBotEventTarget,
} from './index.hooks'

/** 独立 bot の一辺 px（向きを視認しやすいよう大きめ、issue #248） */
const STANDALONE_BOT_SIZE = 160

/**
 * ステージ上の bot とは別に独立表示し、歩行を同期する bot（issue #248）
 *
 * - `interactive` は既定(true)のままにする。false だと walking 等の action が
 *   dispatch を無視し、同期されない
 * - クリック(既定の `clickBindings` = jump/spin)は `actions` に含めないため反応しない
 *   （ステージ上の bot と同じ）
 */
export const StandaloneBot = () => {
  const standaloneBotEventTarget = useStandaloneBotEventTarget()

  return (
    <BoxBot01
      actions={STANDALONE_BOT_ACTIONS}
      eventTarget={standaloneBotEventTarget}
      orbit={false}
      style={{ height: STANDALONE_BOT_SIZE, width: STANDALONE_BOT_SIZE }}
    />
  )
}
