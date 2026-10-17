import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { layoutDecorator } from '@/components/pages/layout.decorator'

import { FindPathProto03Contents } from './_contents'
import { DebugPanel } from './_contents/debug-panel'
import { FindPathProto03Providers } from './index.providers'

import FindPathProto03 from '.'

const meta: Meta<typeof FindPathProto03> = {
  argTypes: {
    initialFogMode: {
      control: 'radio',
      options: ['all-visible', 'all-hidden', 'partial'],
    },
    initialSeed: { control: 'number' },
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

/** 基本構成の下へデバッグ要素を並べる */
export const Debug: Story = {
  render: (args) => (
    <FindPathProto03Providers {...args}>
      <FindPathProto03Contents />
      <DebugPanel />
    </FindPathProto03Providers>
  ),
}

export const Generated: Story = {
  args: {
    initialSeed: 1,
  },
}
