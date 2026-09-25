import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { layoutDecorator } from '@/components/pages/layout.decorator'

import FindPathProto03 from '.'

const meta: Meta<typeof FindPathProto03> = {
  argTypes: {
    initialFogMode: {
      control: 'radio',
      options: ['all-visible', 'all-hidden', 'partial'],
    },
  },
  component: FindPathProto03,
  decorators: [layoutDecorator],
}

export default meta
type Story = StoryObj<typeof FindPathProto03>

export const Default: Story = {}

export const AllVisible: Story = {
  args: {
    initialFogMode: 'all-visible',
  },
}

export const PartialFog: Story = {
  args: {
    initialFogMode: 'partial',
  },
}
