import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBot } from '../_story-decorators'

import { ActionAnchor } from '.'

const meta: Meta<typeof ActionAnchor> = {
  component: ActionAnchor,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof ActionAnchor>

export const Default: Story = {}
