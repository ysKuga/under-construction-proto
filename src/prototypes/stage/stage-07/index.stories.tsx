import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useRef } from 'react'

import { PLAYER_ACTOR_ID } from '../stage-06/constants'

import { colRowToAxial } from './_lib/hex'
import { ActorsStoreProvider, useActorsStore } from './_stores/actors'

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

/** クリックごとにランダムなセルへ mob を spawn するボタン(store 動作確認用) */
const SpawnMobButton = () => {
  const spawnActor = useActorsStore((state) => state.spawnActor)
  const nextMobIndexRef = useRef(1)

  return (
    <button
      onClick={() => {
        const col = Math.floor(Math.random() * DEFAULT_ARGS.cols)
        const row = Math.floor(Math.random() * DEFAULT_ARGS.rows)

        spawnActor(`mob-${nextMobIndexRef.current}`, colRowToAxial(col, row))
        nextMobIndexRef.current += 1
      }}
      type="button"
    >
      mob追加
    </button>
  )
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

// store は Stage07 の外側から直接操作できる(issue #215)。ボタンで spawnActor を
// 叩いても Stage07 に props を渡し直す必要はなく、ActorsLayer だけが再レンダリングされる
export const SpawnableMob: Story = {
  args: DEFAULT_ARGS,
  decorators: [
    (Story) => (
      <ActorsStoreProvider
        initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}
      >
        <SpawnMobButton />
        <Story />
      </ActorsStoreProvider>
    ),
  ],
}
