import { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { CSSProperties, useState } from 'react'

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
/** `Stage07` の既定値(`initialTiltDeg`)と同じ、tilt スライダーの初期値(deg) */
const DEFAULT_TILT_DEG = 55
/** `Stage07` の tilt スライダーと同じ範囲(deg) */
const TILT_RANGE = { max: 85, min: 0 } as const
/** `Stage07` の `sceneStyle.perspective` と同じ値(px) */
const PERSPECTIVE_PX = 800

/**
 * `Stage07`/`ActorsLayer` と同じ位置計算(`hexCellCenter` + `translate(-50%,
 * -53%)`)で bot を配置し、その頭上へ吹き出しを重ねて確認する
 *
 * - `WaypointBubble` はセル中心から bot の高さぶん上に自身を配置するだけで、
 *   実際に bot が同じ位置にいることは前提にしていない。組み合わせないと
 *   「bot 頭上」として正しい位置か判断できないため、単体表示から変更した
 * - `Stage07` の `floor`(`perspective` + `rotateX(var(--floor-tilt))`)を
 *   同じ構造で再現し、tilt スライダーで `--floor-tilt` を動的に変更できる
 *   ようにする（issue #137、吹き出しの位置調整を tilt 込みで確認したい要望）。
 *   bot 自体も `ActorsLayer` と同じ逆 `rotateX` で tilt を打ち消して直立させる
 *   （打ち消さないと tilt を動かすたび bot も一緒に傾いてしまい検証にならない）
 */
const withBot: Decorator = (Story) => {
  const [tilt, setTilt] = useState(DEFAULT_TILT_DEG)

  const bounds = computeHexGridBounds(GRID.cols, GRID.rows, HEX_SIZE)
  const center = hexCellCenter(CURRENT_CELL, HEX_SIZE, bounds)

  const floorStyle: CSSProperties = {
    '--floor-tilt': `${tilt}deg`,
    display: 'inline-block',
    height: bounds.containerHeight,
    position: 'relative',
    transform: 'rotateX(var(--floor-tilt))',
    transformOrigin: 'center bottom',
    transformStyle: 'preserve-3d',
    width: bounds.containerWidth,
  } as CSSProperties

  return (
    <div>
      <label>
        tilt{' '}
        <input
          max={TILT_RANGE.max}
          min={TILT_RANGE.min}
          onChange={(event) => setTilt(Number(event.target.value))}
          type="range"
          value={tilt}
        />{' '}
        {tilt}deg
      </label>
      <div
        style={{
          display: 'inline-block',
          perspective: PERSPECTIVE_PX,
          perspectiveOrigin: 'center 30%',
        }}
      >
        <div style={floorStyle}>
          <div
            style={{
              height: BOT_SIZE,
              left: center.x,
              position: 'absolute',
              top: center.y,
              transform:
                'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt, 0deg)))',
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
      </div>
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
    selectable: false,
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

/** 中継点選択モードが選択可能な状態(store 接続後を想定)。枠線が点線になる */
export const Selectable: Story = {
  args: {
    selectable: true,
    visible: true,
  },
}

export const Hidden: Story = {
  args: {
    visible: false,
  },
}

/** ボタンで `visible`/`selectable` を切替え、表示状態の変化を都度確認できる */
export const Interactive: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(true)
    const [selectable, setSelectable] = useState(false)

    return (
      <>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={() => setVisible((current) => !current)}
            type="button"
          >
            表示: {visible ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setSelectable((current) => !current)}
            type="button"
          >
            選択可能: {selectable ? 'ON' : 'OFF'}
          </button>
        </div>
        <StoryComponent {...args} selectable={selectable} visible={visible} />
      </>
    )
  },
}
