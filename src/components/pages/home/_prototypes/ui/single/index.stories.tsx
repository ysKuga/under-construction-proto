import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotStacked } from '../../_story-decorators'

import { Single } from '.'

const meta: Meta<typeof Single> = {
  component: Single,
  decorators: [withBotStacked],
}

export default meta
type Story = StoryObj<typeof Single>

export const Default: Story = {}
