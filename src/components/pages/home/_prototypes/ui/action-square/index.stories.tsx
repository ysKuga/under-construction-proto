import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBot } from '../../_story-decorators'

import { ActionSquare } from '.'

const meta: Meta<typeof ActionSquare> = {
  component: ActionSquare,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof ActionSquare>

export const Default: Story = {}
