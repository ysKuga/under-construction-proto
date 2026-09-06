import type { Decorator } from '@storybook/react'

import { BoxBot } from '@/components/samples/figure/box-bot'

import { BotOverlay } from '../_components/bot-overlay'

/** bot 表示領域の一辺(px) */
const BOT_SIZE = 640

/** bot ありでラップする decorator。circle/square/anchor 等、画面座標ベース配置の確認に使う */
export const withBot: Decorator = (Story) => (
  <BotOverlay overlay={<Story />} size={BOT_SIZE}>
    <BoxBot canvasHeight={BOT_SIZE} mode="3d" />
  </BotOverlay>
)

/** bot なし、Story をそのままレンダーする decorator */
export const withoutBot: Decorator = (Story) => <Story />
