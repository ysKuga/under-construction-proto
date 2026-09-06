import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotStacked } from '../../_story-decorators'

import { ActionRow } from '.'

const meta: Meta<typeof ActionRow> = {
  component: ActionRow,
  decorators: [withBotStacked],
}

export default meta
type Story = StoryObj<typeof ActionRow>

export const Default: Story = {}
