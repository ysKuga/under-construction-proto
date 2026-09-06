import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withBot } from '../../_story-decorators'

import { Circle } from '.'

const meta: Meta<typeof Circle> = {
  component: Circle,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof Circle>

export const Default: Story = {}
