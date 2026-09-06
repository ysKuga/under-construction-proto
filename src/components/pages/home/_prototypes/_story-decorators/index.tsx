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

/** bot 下部に縦積みでラップする decorator。row/single 等、常時表示型の確認に使う */
export const withBotStacked: Decorator = (Story) => (
  <div className="flex flex-col items-center gap-8">
    <BoxBot canvasHeight={BOT_SIZE} mode="3d" />
    <Story />
  </div>
)

/** bot の 3D 空間内(children)に配置してラップする decorator。3D 投影配置(ring 等)の確認に使う */
export const withBotChildren: Decorator = (Story) => (
  <BoxBot canvasHeight={BOT_SIZE} mode="3d">
    <Story />
  </BoxBot>
)
