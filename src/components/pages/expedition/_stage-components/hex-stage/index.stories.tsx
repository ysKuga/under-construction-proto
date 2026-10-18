import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useCallback, useRef, useState } from 'react'

import { PLAYER_ACTOR_ID } from './constants'

import { MoveOnAdjacentCellClick } from './_components/move-on-adjacent-cell-click'
import {
  HexStageHandleProvider,
  useHexStageHandleRef,
} from './_contexts/hex-stage-handle'
import { HexStageEventProvider, useHexStageEventListener } from './_events'
import { colRowToAxial, HexCell } from './_lib/hex'
import { ActorsStoreProvider, useActorsStore } from './_stores/actors'

import { HexStage as StoryComponent } from '.'

/** context の handle を `ref` へ渡して `HexStage` を描画する（`MoveOnAdjacentCellClick` が参照する） */
const HexStageWithHandle = (args: Story['args']) => {
  const hexStageHandleRef = useHexStageHandleRef()

  return <StoryComponent {...DEFAULT_ARGS} {...args} ref={hexStageHandleRef} />
}

const meta: Meta<typeof StoryComponent> = {
  component: StoryComponent,
  // HexStage はクリックを `HexStage-cell-click` で発行するのみのため、隣接クリック移動を
  // `MoveOnAdjacentCellClick` で補う。各 story の decorator（ActorsStoreProvider 等）はこの内側になる
  decorators: [
    (Story) => (
      <HexStageHandleProvider>
        <HexStageEventProvider>
          <MoveOnAdjacentCellClick />
          <Story />
        </HexStageEventProvider>
      </HexStageHandleProvider>
    ),
  ],
  render: (args) => <HexStageWithHandle {...args} />,
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

// provider は HexStage の外側に置く構成（issue #181 PR-A）。story では decorator で巻く。
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

// store は HexStage の外側から直接操作できる(issue #215)。ボタンで spawnActor を
// 叩いても HexStage に props を渡し直す必要はなく、ActorsLayer だけが再レンダリングされる
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

/** player の到達(`HexStage-cell-reach`)セルを発行順に一覧表示する(ワープ時の到達確認用) */
const ReachLog = () => {
  /** 到達したセルの発行順の一覧 */
  const [reachedCells, setReachedCells] = useState<HexCell[]>([])

  useHexStageEventListener(
    'HexStage-cell-reach',
    useCallback((event) => {
      if (event.detail.actorId !== PLAYER_ACTOR_ID) return

      setReachedCells((cells) => [...cells, event.detail.cell])
    }, []),
  )

  return (
    <ol aria-label="到達ログ">
      {reachedCells.map((cell, index) => (
        <li key={index}>
          q={cell.q}, r={cell.r}
        </li>
      ))}
    </ol>
  )
}

/** クリックごとにランダムなセルへ player をワープさせる story 用 render(`HexStageHandle.warp` 動作確認用) */
const WarpRender = (args: Story['args']) => {
  /** `HexStage` の imperative API */
  const hexStageHandleRef = useHexStageHandleRef()

  return (
    <>
      <button
        onClick={() => {
          const col = Math.floor(Math.random() * DEFAULT_ARGS.cols)
          const row = Math.floor(Math.random() * DEFAULT_ARGS.rows)

          hexStageHandleRef.current?.warp(colRowToAxial(col, row))
        }}
        type="button"
      >
        ワープ
      </button>
      <StoryComponent {...DEFAULT_ARGS} {...args} ref={hexStageHandleRef} />
      <ReachLog />
    </>
  )
}

// ワープ後のクリック移動がワープ先から滑らかに始まることも確認する(issue #289)。
// 到達ログで、ワープ時はワープ先セルのみ到達が発行されることを確認できる
export const Warp: Story = {
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
  render: (args) => <WarpRender {...args} />,
}

/** hover 中セルの表示文言 */
const formatHoveredCell = (cell: HexCell | undefined) =>
  cell ? `q=${cell.q}, r=${cell.r}` : 'なし'

/**
 * hover 中セルを表示する(`HexStage-cell-hover` の動作確認用)
 *
 * - hover の変化を state に持たず、ref 経由で DOM の `textContent` を直接書き換える。\
 *   hover しても本 component・`HexStage` とも再レンダリングされない
 * - React が子要素を描画しない空要素へのみ書き込む(React の差分更新と衝突させない)
 */
const HoveredCellLabel = () => {
  /** 表示先の要素 */
  const labelRef = useRef<HTMLParagraphElement>(null)

  useHexStageEventListener(
    'HexStage-cell-hover',
    useCallback((event) => {
      if (!labelRef.current) return

      labelRef.current.textContent = formatHoveredCell(event.detail.cell)
    }, []),
  )

  return (
    <p
      aria-label="hover 中のセル"
      // 初期表示(hover なし)。マウント時に1度だけ書き込む
      ref={useCallback((el: HTMLParagraphElement | null) => {
        labelRef.current = el
        if (el) el.textContent = formatHoveredCell(undefined)
      }, [])}
    />
  )
}

// セル間の移動では解除(なし)を挟まず、layer 外へ出た時のみ「なし」になる(PR #308)
export const CellHover: Story = {
  args: DEFAULT_ARGS,
  decorators: [
    (Story) => (
      <ActorsStoreProvider
        initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}
      >
        <HoveredCellLabel />
        <Story />
      </ActorsStoreProvider>
    ),
  ],
}
