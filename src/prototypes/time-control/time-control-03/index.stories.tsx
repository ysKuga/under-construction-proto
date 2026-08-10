import { Meta, StoryObj } from '@storybook/react'

import { TimeControl03 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Primary: Story = {
  args: {
    actorIds: ['actor-a', 'actor-b', 'actor-c'],
  },
}
