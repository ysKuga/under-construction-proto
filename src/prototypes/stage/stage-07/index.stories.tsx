import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Stage07 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  // 自動生成タイトルは "prototypes/stage/stage-07" のみで "hex" を含まず検索
  // にひっかからないため明示指定（issue #162）
  title: 'prototypes/stage/stage-07 (hex)',
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    botSize: 60,
    cols: 5,
    hexSize: 40,
    rows: 5,
  },
}
