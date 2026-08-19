import { Meta, StoryObj } from '@storybook/react'

import BoxBot3D from '.'

const meta: Meta<typeof BoxBot3D> = {
  component: BoxBot3D,
}

export default meta
type Story = StoryObj<typeof BoxBot3D>

export const Default: Story = {}

export const Static: Story = {
  args: {
    autoRotate: false,
    interactive: false,
    orbit: false,
  },
}

export const Straight: Story = {
  args: {
    outline: false,
    sketch: 0,
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <BoxBot3D style={{ height: 320, width: 320 }} />
      <BoxBot3D style={{ height: 200, width: 200 }} />
      <BoxBot3D style={{ height: 120, width: 120 }} />
    </div>
  ),
}
