import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ActorNodeRegistryProvider } from './_contexts/actor-node-registry'

import { Stage07 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  // provider は Stage07 の外側に置く構成（issue #181 PR-A）。story では decorator で巻く
  decorators: [
    (Story) => (
      <ActorNodeRegistryProvider>
        <Story />
      </ActorNodeRegistryProvider>
    ),
  ],
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

export const WithMob: Story = {
  args: {
    ...Default.args,
    // col=2, row=2 の axial 座標(5x5 グリッドの中央付近、`colRowToAxial` 参照)
    mobs: [{ cell: { q: 2, r: 1 }, id: 'mob-1' }],
  },
}
