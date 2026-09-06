import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBot } from '../../_story-decorators'

import { Square } from '.'

const meta: Meta<typeof Square> = {
  component: Square,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof Square>

export const Default: Story = {}
