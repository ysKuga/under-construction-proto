import { Meta, StoryObj } from '@storybook/nextjs-vite'

import Home from '.'

const meta: Meta<typeof Home> = {
  component: Home,
}

export default meta
type Story = StoryObj<typeof Home>

export const Default: Story = {
  args: {},
}
