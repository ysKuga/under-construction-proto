import { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'

import { BoxBot01 } from '@/components/theater/figure/box-bot'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { WaypointBubble as StoryComponent } from '.'

const GRID = { cols: 5, rows: 5 } as const
/** 六角形の外接円半径 (px)。story 側の座標計算のみに使う */
const HEX_SIZE = 40
/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56
/** bot を配置するセル。`WaypointBubble` の `currentCell` と揃える */
const CURRENT_CELL = { q: 2, r: 2 } as const

/**
 * `Stage07`/`ActorsLayer` と同じ位置計算(`hexCellCenter` + `translate(-50%,
 * -53%)`)で bot を配置し、その頭上へ吹き出しを重ねて確認する
 *
 * - `WaypointBubble` はセル中心から bot の高さぶん上に自身を配置するだけで、
 *   実際に bot が同じ位置にいることは前提にしていない。組み合わせないと
 *   「bot 頭上」として正しい位置か判断できないため、単体表示から変更した
 */
const withBot: Decorator = (Story) => {
  const bounds = computeHexGridBounds(GRID.cols, GRID.rows, HEX_SIZE)
  const center = hexCellCenter(CURRENT_CELL, HEX_SIZE, bounds)

  return (
    <div
      style={{
        height: bounds.containerHeight,
        position: 'relative',
        width: bounds.containerWidth,
      }}
    >
      <div
        style={{
          height: BOT_SIZE,
          left: center.x,
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -53%)',
          width: BOT_SIZE,
        }}
      >
        <BoxBot01
          interactive={false}
          orbit={false}
          style={{ height: BOT_SIZE, width: BOT_SIZE }}
        />
      </div>
      <Story />
    </div>
  )
}

const meta: Meta<typeof StoryComponent> = {
  args: {
    botSize: BOT_SIZE,
    cols: GRID.cols,
    currentCell: CURRENT_CELL,
    hexSize: HEX_SIZE,
    onClick: () => {},
    rows: GRID.rows,
  },
  component: StoryComponent,
  decorators: [withBot],
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    visible: true,
  },
}

export const Hidden: Story = {
  args: {
    visible: false,
  },
}
