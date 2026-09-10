import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ActorNodeRegistryProvider } from './_contexts/actor-node-registry'

import { Stage06 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  // provider は Stage06 の外側に置く構成（PR-C）。story では decorator で巻く
  decorators: [
    (Story, ctx) => (
      <ActorNodeRegistryProvider
        gridSize={{ cols: ctx.args.cols ?? 5, rows: ctx.args.rows ?? 5 }}
      >
        <Story />
      </ActorNodeRegistryProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof StoryComponent>

const cols = 5
const rows = 5
const size = 400
/** actor の一辺 px。マスサイズ (size / cols = 80) とは独立に指定する */
const botSize = 56

export const Primary: Story = {
  args: {
    botSize,
    cols,
    initialTiltDeg: 55,
    perspectivePx: 600,
    rows,
    size,
  },
}

export const StrongTilt: Story = {
  args: {
    botSize,
    cols,
    initialTiltDeg: 68,
    perspectivePx: 400,
    rows,
    size,
  },
}

export const NonSquareGrid: Story = {
  args: {
    botSize,
    cols: 4,
    initialTiltDeg: 55,
    perspectivePx: 600,
    rows: 7,
    size,
  },
}
