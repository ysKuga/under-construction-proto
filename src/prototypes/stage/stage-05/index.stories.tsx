import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stage05 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

const cols = 5
const rows = 5
const width = 500
const height = 420
const depthScale = 0.45

export const Primary: Story = {
  args: {
    cols,
    depthScale,
    height,
    rows,
    width,
  },
}

export const NonSquareGrid: Story = {
  args: {
    cols: 4,
    depthScale,
    height: 560,
    rows: 7,
    width,
  },
}

export const StrongDepth: Story = {
  args: {
    cols,
    depthScale: 0.25,
    height,
    rows,
    width,
  },
}
