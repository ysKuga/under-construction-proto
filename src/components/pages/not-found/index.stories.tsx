import { Meta, StoryObj } from '@storybook/nextjs-vite'

import NotFound from '.'

const meta: Meta<typeof NotFound> = {
  component: NotFound,
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
}

export default meta
type Story = StoryObj<typeof NotFound>

export const Default: Story = {
  args: {},
}
