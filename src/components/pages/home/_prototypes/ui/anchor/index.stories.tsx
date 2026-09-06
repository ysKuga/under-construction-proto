import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBot } from '../../_story-decorators'

import { Anchor } from '.'

const meta: Meta<typeof Anchor> = {
  component: Anchor,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof Anchor>

export const Default: Story = {}
