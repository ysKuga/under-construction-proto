import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { of } from 'rxjs'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import { ExecuteBubble } from '../execute-bubble'
import { WaypointBubble } from '../waypoint-bubble'

import { BubbleSlotsStoreProvider } from './_stores/bubble-slots'
import { BubbleSlotEntry } from './_stores/bubble-slots/types'

import { BubbleSlots as StoryComponent } from '.'

/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56

/** 格納する吹き出し */
const INITIAL_BUBBLES: BubbleSlotEntry[] = [
  { Bubble: WaypointBubble, id: 'waypoint', visible$: of(true) },
  { Bubble: ExecuteBubble, id: 'execute', visible$: of(true) },
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
