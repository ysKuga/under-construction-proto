import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { layoutDecorator } from '../layout.decorator'

import Home from '.'

const meta: Meta<typeof Home> = {
  component: Home,
  decorators: [layoutDecorator],
}

export default meta
type Story = StoryObj<typeof Home>

export const Default: Story = {
  args: {},
  name: 'home (/)',
}
