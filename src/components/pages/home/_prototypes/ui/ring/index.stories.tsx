import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotChildren } from '../../_story-decorators'

import { Ring } from '.'

const meta: Meta<typeof Ring> = {
  component: Ring,
  decorators: [withBotChildren],
}

export default meta
type Story = StoryObj<typeof Ring>

export const Default: Story = {}
