import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stage07 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    botSize: 60,
    cols: 5,
    hexSize: 40,
    rows: 5,
  },
}
