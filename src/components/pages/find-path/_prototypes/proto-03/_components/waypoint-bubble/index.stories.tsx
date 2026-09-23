import { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'

import { WaypointBubble as StoryComponent } from '.'

/** `WaypointBubble` が `position: absolute` で自身の位置を計算するための、高さを持つ基準コンテナ */
const containerDecorator: Decorator = (Story) => (
  <div style={{ height: 300, position: 'relative', width: 300 }}>
    <Story />
  </div>
)

const meta: Meta<typeof StoryComponent> = {
  args: {
    botSize: 56,
    cols: 5,
    currentCell: { q: 2, r: 2 },
    hexSize: 40,
    onClick: () => {},
    rows: 5,
  },
  component: StoryComponent,
  decorators: [containerDecorator],
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    visible: true,
  },
}

export const Hidden: Story = {
  args: {
    visible: false,
  },
}
