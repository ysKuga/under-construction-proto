'use client'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import {
  STANDALONE_BOT_ACTIONS,
  useStandaloneBotEventTarget,
} from './index.hooks'

/** 独立 bot の一辺 px（向きを視認しやすいよう大きめ、issue #248） */
const STANDALONE_BOT_SIZE = 160

/** ステージ上の bot とは別に独立表示し、歩行を同期する bot（issue #248） */
export const StandaloneBot = () => {
  const standaloneBotEventTarget = useStandaloneBotEventTarget()

  return (
    <BoxBot01
      actions={STANDALONE_BOT_ACTIONS}
      eventTarget={standaloneBotEventTarget}
      interactive={false}
      orbit={false}
      style={{ height: STANDALONE_BOT_SIZE, width: STANDALONE_BOT_SIZE }}
    />
  )
}
