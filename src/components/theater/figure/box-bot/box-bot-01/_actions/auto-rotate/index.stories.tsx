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
 * auto-rotate action の挙動・パラメータ調節
 *
 * - Toggle ボタンで自動回転の on/off。spin と違い自動では止まらない
 * - スライダーで角速度(rad/s)を変え、on へ切替える dispatch の override 引数
 *   (`autoRotate({ speed })`)として渡す
 * - yaw 回転のみ。spin と同じ回転グループへ相乗りする(表示領域は動かない)
 */
export const AutoRotate: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { autoRotate } = useBoxBotActionDispatcher(eventTarget)
    const [speed, setSpeed] = React.useState(0.6)

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
            onClick={() => void autoRotate({ speed })}
            type="button"
            variant="outline"
          >
            Toggle
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            speed {speed.toFixed(2)} rad/s
            <input
              max={4}
              min={0}
              onChange={(e) => setSpeed(Number(e.target.value))}
              step={0.1}
              type="range"
              value={speed}
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
