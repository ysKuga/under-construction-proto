import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBot } from '../_story-decorators'

import { ActionCircle } from '.'

const meta: Meta<typeof ActionCircle> = {
  component: ActionCircle,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof ActionCircle>

export const Default: Story = {}
