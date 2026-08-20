import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MDPreview } from './md-preview'

const meta: Meta<typeof MDPreview> = {
  component: MDPreview,
}

export default meta

type Story = StoryObj<typeof MDPreview>

export const Default: Story = {
  args: {
    value: `## Hello World!`,
  },
}
