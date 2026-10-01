import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BoxBot01 } from '@/components/theater/figure/box-bot'

import { BubbleSlotsStoreProvider } from './_stores/bubble-slots'

import { BubbleSlots as StoryComponent } from '.'

/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  decorators: [
    (Story) => (
      <BubbleSlotsStoreProvider>
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
