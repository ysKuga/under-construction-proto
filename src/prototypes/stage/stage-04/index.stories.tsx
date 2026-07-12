import { Meta, StoryObj } from '@storybook/react'

import { Stage04 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

const cols = 5
const rows = 5
const scale = 500

export const Primary: Story = {
  args: {
    cols,
    rows,
    scale,
  },
}

export const NonSquareGrid: Story = {
  args: {
    cols: 4,
    rows: 7,
    scale,
  },
}
