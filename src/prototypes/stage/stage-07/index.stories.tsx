import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PLAYER_ACTOR_ID } from '../stage-06/constants'

import { ActorsStoreProvider } from './_stores/actors'

import { Stage07 as StoryComponent } from '.'

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  // 自動生成タイトルは "prototypes/stage/stage-07" のみで "hex" を含まず検索
  // にひっかからないため明示指定（issue #162）
  title: 'prototypes/stage/stage-07 (hex)',
}

export default meta
type Story = StoryObj<typeof StoryComponent>

const DEFAULT_ARGS = {
  botSize: 60,
  cols: 5,
  hexSize: 40,
  rows: 5,
}

// provider は Stage07 の外側に置く構成（issue #181 PR-A）。story では decorator で巻く。
// 初期 actor 構成が story ごとに異なるため decorator も story 単位で定義する
export const Default: Story = {
  args: DEFAULT_ARGS,
  decorators: [
    (Story) => (
      <ActorsStoreProvider
        initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}
      >
        <Story />
      </ActorsStoreProvider>
    ),
  ],
}

export const WithMob: Story = {
  args: DEFAULT_ARGS,
  decorators: [
    (Story) => (
      <ActorsStoreProvider
        initialActors={{
          // col=2, row=2 の axial 座標(5x5 グリッドの中央付近、`colRowToAxial` 参照)
          'mob-1': { q: 2, r: 1 },
          [PLAYER_ACTOR_ID]: { q: 0, r: 0 },
        }}
      >
        <Story />
      </ActorsStoreProvider>
    ),
  ],
}
