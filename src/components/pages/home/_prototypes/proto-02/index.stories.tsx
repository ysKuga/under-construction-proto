import { Meta, StoryObj } from '@storybook/nextjs-vite'

import Proto02 from '.'

const meta: Meta<typeof Proto02> = {
  component: Proto02,
}

export default meta
type Story = StoryObj<typeof Proto02>

export const Default: Story = {}

export const Single: Story = {
  args: { actionLayout: 'single' },
}

export const Circle: Story = {
  args: { actionLayout: 'circle' },
}

export const Square: Story = {
  args: { actionLayout: 'square' },
}

export const Ring: Story = {
  args: { actionLayout: 'ring' },
}

export const Anchor: Story = {
  args: { actionLayout: 'anchor' },
}
