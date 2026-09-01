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
 * arm-toggle action の挙動・パラメータ調節
 *
 * - Left / Right / Both ボタンで該当の腕の上げ下げをトグル。`approach` で補間して動く
 * - upDelta スライダーで下げ位置からの持ち上げ角(rad)を変え、dispatch の override 引数
 *   ではなく `actionConfig` で既定を差し替えて確認する(persist する設定のため)
 * - 静的な肩の開き(`cfg.arm.leftAngle` / `rightAngle`)に足し込まれる。z 軸回転のみで
 *   表示領域は動かない
 */
export const ArmToggle: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { armToggle } = useBoxBotActionDispatcher(eventTarget)
    const [upDelta, setUpDelta] = React.useState(1.75)

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
            onClick={() => void armToggle({ side: 'left' })}
            type="button"
            variant="outline"
          >
            Left
          </Button>
          <Button
            onClick={() => void armToggle({ side: 'right' })}
            type="button"
            variant="outline"
          >
            Right
          </Button>
          <Button
            onClick={() => void armToggle({ side: 'both' })}
            type="button"
            variant="outline"
          >
            Both
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            upDelta {upDelta.toFixed(2)} rad
            <input
              max={3}
              min={0}
              onChange={(e) => setUpDelta(Number(e.target.value))}
              step={0.05}
              type="range"
              value={upDelta}
            />
          </label>
        </div>
        <BoxBot
          actionConfig={{ armToggle: { upDelta } }}
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
