import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { layoutDecorator } from '@/components/pages/layout.decorator'

import { ExpeditionContents } from './_contents'
import { DebugPanel } from './_components/debug-panel'
import { ExpeditionProviders } from './index.providers'

import Expedition from '.'

const meta: Meta<typeof Expedition> = {
  argTypes: {
    initialFogMode: {
      control: 'radio',
      options: ['all-visible', 'all-hidden', 'partial'],
    },
    initialSeed: { control: 'number' },
  },
  component: Expedition,
  decorators: [layoutDecorator],
}

export default meta
type Story = StoryObj<typeof Expedition>

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
    <ExpeditionProviders {...args}>
      <ExpeditionContents />
      <DebugPanel />
    </ExpeditionProviders>
  ),
}

export const Generated: Story = {
  args: {
    initialSeed: 1,
  },
}
