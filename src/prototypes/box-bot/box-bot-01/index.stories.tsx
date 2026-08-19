import { Meta, StoryObj } from '@storybook/react'

import BoxBot from '.'

const meta: Meta<typeof BoxBot> = {
  component: BoxBot,
}

export default meta
type Story = StoryObj<typeof BoxBot>

export const Default: Story = {
  args: {
    width: 200,
  },
}

export const Straight: Story = {
  args: {
    width: 200,
    wobble: 0,
  },
}

export const Animated: Story = {
  args: {
    animate: true,
    drawDuration: 0.4,
    width: 200,
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ alignItems: 'flex-end', display: 'flex', gap: 16 }}>
      <BoxBot width={240} />
      <BoxBot width={160} />
      <BoxBot width={80} />
    </div>
  ),
}
