import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { of } from 'rxjs'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import { BotBubble } from '../bot-bubble'

import { BubbleSlotsStoreProvider } from './_stores/bubble-slots'
import { BubbleSlotEntry } from './_stores/bubble-slots/types'

import { BubbleSlots as StoryComponent } from '.'

/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56

/** 仮の操作。story では吹き出しの操作を接続しない */
const noop = () => {}

/** 中継点の吹き出し（操作は未接続） */
const StoryWaypointBubble = () => (
  <BotBubble
    ariaLabel="中継点選択モードの切替"
    offset={{ x: 24, y: -36 }}
    onClick={noop}
    speechHoverText="中継点🚫"
    speechText="中継点！"
    thoughtText="中継点？"
  />
)

/** 実行の吹き出し（操作は未接続） */
const StoryExecuteBubble = () => (
  <BotBubble
    ariaLabel="経路に沿って自動移動を開始"
    closeAriaLabel="目標設定をキャンセル"
    offset={{ x: 20, y: -36 }}
    onClick={noop}
    onClose={noop}
    speechText="実行！"
    thoughtText="実行？"
  />
)

/** 格納する吹き出し */
const INITIAL_BUBBLES: BubbleSlotEntry[] = [
  { Bubble: StoryWaypointBubble, id: 'waypoint', visible$: of(true) },
  { Bubble: StoryExecuteBubble, id: 'execute', visible$: of(true) },
]

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  decorators: [
    (Story) => (
      <BubbleSlotsStoreProvider initialBubbles={INITIAL_BUBBLES}>
        <div style={{ padding: 80 }}>
          <Story />
        </div>
      </BubbleSlotsStoreProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    children: (
      <BoxBot01
        interactive={false}
        orbit={false}
        style={{ height: BOT_SIZE, width: BOT_SIZE }}
      />
    ),
  },
}

/** 「実行」の表示中、`action` 種類の「中継点」を隠す */
export const HiddenByKind: Story = {
  ...Default,
  decorators: [
    (Story) => (
      <BubbleSlotsStoreProvider
        initialBubbles={[
          {
            Bubble: StoryWaypointBubble,
            id: 'waypoint',
            kinds: ['action'],
            visible$: of(true),
          },
          {
            Bubble: StoryExecuteBubble,
            hides: ['action'],
            id: 'execute',
            visible$: of(true),
          },
        ]}
      >
        <Story />
      </BubbleSlotsStoreProvider>
    ),
  ],
}
