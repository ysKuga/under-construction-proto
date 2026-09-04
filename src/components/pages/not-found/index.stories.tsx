import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { layoutDecorator } from '../layout.decorator'

import NotFound from '.'

const meta: Meta<typeof NotFound> = {
  component: NotFound,
  decorators: [layoutDecorator],
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
