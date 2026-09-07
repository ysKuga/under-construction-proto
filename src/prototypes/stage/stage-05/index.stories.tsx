import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stage05 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

const cols = 5
const rows = 5
const size = 400

export const Primary: Story = {
  args: {
    cols,
    initialTiltDeg: 55,
    perspectivePx: 600,
    rows,
    size,
  },
}

export const StrongTilt: Story = {
  args: {
    cols,
    initialTiltDeg: 68,
    perspectivePx: 400,
    rows,
    size,
  },
}

export const NonSquareGrid: Story = {
  args: {
    cols: 4,
    initialTiltDeg: 55,
    perspectivePx: 600,
    rows: 7,
    size,
  },
}
