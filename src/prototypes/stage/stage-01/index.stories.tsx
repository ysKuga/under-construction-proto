import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stage01 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Primary: Story = {
  args: {
    cols: 5,
    rows: 5,
  },
}
