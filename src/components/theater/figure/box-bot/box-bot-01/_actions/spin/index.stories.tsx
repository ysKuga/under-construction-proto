import { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import BoxBot from '../..'
import { useBoxBotActionDispatcher } from '../../_components/box-bot-model/use-box-bot-action-dispatcher'

const meta: Meta<typeof BoxBot> = {
  component: BoxBot,
}

export default meta
type Story = StoryObj<typeof BoxBot>

/**
 * spin action の挙動・パラメータ調節
 *
 * - Spin ボタンで単発スピン(加速 → 最大速度維持 → 減速 → 停止)。スライダーで最大角速度・\
 *   維持時間を変え、dispatch の override 引数(`spin({...})`)として渡す
 * - jump と違い縦移動なし。yaw 回転のみで表示領域は動かない
 */
export const Spin: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { spin } = useBoxBotActionDispatcher(eventTarget)
    const [maxSpeed, setMaxSpeed] = React.useState(12)
    const [holdSec, setHoldSec] = React.useState(0.5)

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
            onClick={() => void spin({ holdSec, maxSpeed })}
            type="button"
            variant="outline"
          >
            Spin
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            maxSpeed {maxSpeed}
            <input
              max={40}
              min={2}
              onChange={(e) => setMaxSpeed(Number(e.target.value))}
              step={2}
              type="range"
              value={maxSpeed}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            hold {holdSec.toFixed(2)}s
            <input
              max={3}
              min={0}
              onChange={(e) => setHoldSec(Number(e.target.value))}
              step={0.1}
              type="range"
              value={holdSec}
            />
          </label>
        </div>
        <BoxBot
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
