import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotChildren } from '../_story-decorators'

import { ActionRing } from '.'

const meta: Meta<typeof ActionRing> = {
  component: ActionRing,
  decorators: [withBotChildren],
}

export default meta
type Story = StoryObj<typeof ActionRing>

export const Default: Story = {}
