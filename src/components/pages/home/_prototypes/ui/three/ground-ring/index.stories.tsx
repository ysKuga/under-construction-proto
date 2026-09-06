import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotChildren } from '../../_story-decorators'

import { GroundRing } from '.'

const meta: Meta<typeof GroundRing> = {
  component: GroundRing,
  decorators: [withBotChildren],
}

export default meta
type Story = StoryObj<typeof GroundRing>

export const Default: Story = {}
