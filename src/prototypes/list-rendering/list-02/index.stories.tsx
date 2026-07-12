import { Meta, StoryObj } from '@storybook/react'

import { List02 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

const items = Array.from({ length: 500 }).map((_, index) => ({
  id: `item-${index}`,
  name: `名前-${index}`,
}))

export const WithoutTransition: Story = {
  args: {
    items,
    useTransitionEnabled: false,
  },
}

export const WithTransition: Story = {
  args: {
    items,
    useTransitionEnabled: true,
  },
}
