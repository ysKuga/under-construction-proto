import { Meta, StoryObj } from '@storybook/nextjs-vite'

import Proto01 from '.'

const meta: Meta<typeof Proto01> = {
  component: Proto01,
}

export default meta
type Story = StoryObj<typeof Proto01>

export const Default: Story = {}
