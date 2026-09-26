'use client'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

/** 独立 bot の一辺 px（向きを視認しやすいよう大きめ、issue #248） */
const STANDALONE_BOT_SIZE = 160

/** ステージ上の bot とは別に独立表示する bot（状態同期は後続、issue #248） */
export const StandaloneBot = () => (
  <BoxBot01
    actions={[]}
    interactive={false}
    orbit={false}
    style={{ height: STANDALONE_BOT_SIZE, width: STANDALONE_BOT_SIZE }}
  />
)
