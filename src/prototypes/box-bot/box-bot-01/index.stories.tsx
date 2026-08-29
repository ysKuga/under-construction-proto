import { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import { useBoxBotActionDispatcher } from './_components/box-bot-model/use-box-bot-action-dispatcher'

import StoryComponent from '.'

const meta: Meta<typeof StoryComponent> = {
  args: {
    // 表示領域の上下移動の確認では影が邪魔になるため消す
    shadowOpacity: 0,
    // 設置領域(Assembly)の枠。ジャンプ時に表示領域(Canvas)が設置領域を
    // 上方向へ逸脱する様子を確認するため
    style: { outline: '1px solid red' },
  },
  component: StoryComponent,
}

export default meta
type Story = StoryObj<typeof StoryComponent>

/** 頭/胴をクリックでジャンプ */
export const Default: Story = {}

/**
 * `actionConfig` prop で jump の既定値を上書き
 *
 * - dispatch の 1 回上書き(`jump({...})`)ではなく props で既定を差し替える。\
 *   クリック起点・hopping にも効く
 * - `BoxBot3DConfig` に jump フィールドは無く、値は `_actions/jump` の descriptor が持つ(残る結合 A)
 */
export const ConfigOverride: Story = {
  args: {
    actionConfig: { jump: { durSec: 0.8, liftPx: 260 } },
  },
}

/**
 * jump action の挙動・パラメータ調節
 *
 * - Jump ボタンで単発ジャンプ。スライダーで持ち上げ量(px)・継続時間(秒)を変え、\
 *   dispatch の override 引数(`jump({ liftPx, durSec })`)として渡す
 * - #108: 縦移動は表示領域(Canvas)ごと。設置領域(赤枠)を上へ飛び出す
 */
export const Jump: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { jump } = useBoxBotActionDispatcher(eventTarget)
    const [liftPx, setLiftPx] = React.useState(130)
    const [durSec, setDurSec] = React.useState(0.55)

    return (
      <div>
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 12,
            position: 'relative',
            zIndex: 10,
          }}
        >
          <Button
            onClick={() => void jump({ durSec, liftPx })}
            type="button"
            variant="outline"
          >
            Jump
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            lift {liftPx}px
            <input
              max={400}
              min={0}
              onChange={(e) => setLiftPx(Number(e.target.value))}
              step={10}
              type="range"
              value={liftPx}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            dur {durSec.toFixed(2)}s
            <input
              max={2}
              min={0.2}
              onChange={(e) => setDurSec(Number(e.target.value))}
              step={0.05}
              type="range"
              value={durSec}
            />
          </label>
        </div>
        <StoryComponent
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
