import { Meta, StoryObj } from '@storybook/react'

import { Robot01 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Primary: Story = {
  args: {
    style: {
      height: 200,
    },
  },
}
