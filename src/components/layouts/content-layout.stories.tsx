import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ContentLayout } from './content-layout'

const meta: Meta<typeof ContentLayout> = {
  component: ContentLayout,
}

export default meta
type Story = StoryObj<typeof ContentLayout>

export const Default: Story = {
  args: {
    children: <p>コンテンツ領域</p>,
    title: 'Content Layout',
  },
}
