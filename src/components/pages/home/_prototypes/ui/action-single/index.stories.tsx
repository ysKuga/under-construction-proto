import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotStacked } from '../_story-decorators'

import { ActionSingle } from '.'

const meta: Meta<typeof ActionSingle> = {
  component: ActionSingle,
  decorators: [withBotStacked],
}

export default meta
type Story = StoryObj<typeof ActionSingle>

export const Default: Story = {}
