import { Meta, StoryObj } from '@storybook/react'

import { List01 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Primary: Story = {
  args: {
    items: [
      { id: 'item-1', name: 'アリス' },
      { id: 'item-2', name: 'ボブ' },
      { id: 'item-3', name: 'キャロル' },
    ],
  },
}
