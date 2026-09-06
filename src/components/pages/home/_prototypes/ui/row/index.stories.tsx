import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBotStacked } from '../../_story-decorators'

import { Row } from '.'

const meta: Meta<typeof Row> = {
  component: Row,
  decorators: [withBotStacked],
}

export default meta
type Story = StoryObj<typeof Row>

export const Default: Story = {}
