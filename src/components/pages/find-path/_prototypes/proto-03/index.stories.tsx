import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { layoutDecorator } from '@/components/pages/layout.decorator'

import FindPathProto03 from '.'

const meta: Meta<typeof FindPathProto03> = {
  component: FindPathProto03,
  decorators: [layoutDecorator],
}

export default meta
type Story = StoryObj<typeof FindPathProto03>

export const Default: Story = {}
