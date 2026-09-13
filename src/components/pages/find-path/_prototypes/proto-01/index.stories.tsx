import { Meta, StoryObj } from '@storybook/nextjs-vite'

import FindPathProto01 from '.'

const meta: Meta<typeof FindPathProto01> = {
  component: FindPathProto01,
}

export default meta
type Story = StoryObj<typeof FindPathProto01>

export const Default: Story = {}

/** 同じセルを複数回選択した場合の番号表示を「重ねる」方式で試す比較用 story */
export const StackedVariant: Story = {
  args: {
    plannedPathVariant: 'stacked',
  },
}

/** 同じセルの重複選択自体を禁止する方式を試す比較用 story（最終的な採用方針） */
export const NoDuplicateSelection: Story = {
  args: {
    plannedPathAllowDuplicateSelection: false,
  },
}
