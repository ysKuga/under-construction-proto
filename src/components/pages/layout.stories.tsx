import { Meta, StoryObj } from '@storybook/nextjs-vite'

import PagesLayout from './layout'

const meta: Meta<typeof PagesLayout> = {
  component: PagesLayout,
}

export default meta
type Story = StoryObj<typeof PagesLayout>

export const Default: Story = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Page content</h1>
        <p>AppProvider + &lt;main&gt; の枠だけを適用した状態</p>
      </div>
    ),
  },
}
