import { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CSSProperties, PropsWithChildren, useState } from 'react'

import { BoxBot01 } from '@/components/theater/figure/box-bot'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import {
  WaypointBubble as StoryComponent,
  WAYPOINT_BUBBLE_POSITION_CLASS_NAME,
} from '.'

const GRID = { cols: 5, rows: 5 } as const
/** 六角形の外接円半径 (px)。story 側の座標計算のみに使う */
const HEX_SIZE = 40
/** bot(box-bot-01)の一辺 px */
const BOT_SIZE = 56
/** bot を配置するセル */
const CURRENT_CELL = { q: 2, r: 2 } as const
/** `Stage07` の既定値(`initialTiltDeg`)と同じ、tilt スライダーの初期値(deg) */
const DEFAULT_TILT_DEG = 55
/** `Stage07` の tilt スライダーと同じ範囲(deg) */
const TILT_RANGE = { max: 85, min: 0 } as const
/** `Stage07` の `sceneStyle.perspective` と同じ値(px) */
const PERSPECTIVE_PX = 800

/**
 * `Stage07`/`ActorsLayer` と同じ位置計算(`hexCellCenter` + `translate(-50%,
 * -53%)`)で bot を配置し、その頭上へ `children`（吹き出し）を重ねて確認する
 *
 * - decorator でなく通常のコンポーネントとして各 story の `render` から呼ぶ
 *   （issue #137、修正方針決定に伴い decorator 形式から書き換え）
 * - `WaypointBubble` はセル中心から bot の高さぶん上に自身を配置するだけで、
 *   実際に bot が同じ位置にいることは前提にしていない。組み合わせないと
 *   「bot 頭上」として正しい位置か判断できない
 * - `Stage07` の `floor`(`perspective` + `rotateX(var(--floor-tilt))`)を
 *   同じ構造で再現し、tilt スライダーで `--floor-tilt` を動的に変更できる
 *   ようにする。bot 自体も `ActorsLayer` と同じ逆 `rotateX` で tilt を打ち消して
 *   直立させる（打ち消さないと tilt を動かすたび bot も一緒に傾いてしまい
 *   検証にならない）
 * - `children`（吹き出し）は floor 内、bot と同じ 3D 空間に配置する。表示切替
 *   ボタン等 floor の外に置きたい UI は呼び出し側で `BubbleStage` の外側へ置く
 */
const BubbleStage = (props: PropsWithChildren) => {
  const { children } = props
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
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const meta: Meta<typeof StoryComponent> = {
  args: {
    className: WAYPOINT_BUBBLE_POSITION_CLASS_NAME,
    onClick: () => {},
    selectable: false,
  },
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

export const Default: Story = {
  args: {
    visible: true,
  },
  render: (args) => (
    <BubbleStage>
      <StoryComponent {...args} />
    </BubbleStage>
  ),
}

/** 中継点選択モードが選択可能な状態(store 接続後を想定)。枠線が点線になる */
export const Selectable: Story = {
  args: {
    selectable: true,
    visible: true,
  },
  render: (args) => (
    <BubbleStage>
      <StoryComponent {...args} />
    </BubbleStage>
  ),
}

export const Hidden: Story = {
  args: {
    visible: false,
  },
  render: (args) => (
    <BubbleStage>
      <StoryComponent {...args} />
    </BubbleStage>
  ),
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
        <BubbleStage>
          <StoryComponent {...args} selectable={selectable} visible={visible} />
        </BubbleStage>
      </>
    )
  },
}
