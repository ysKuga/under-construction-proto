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

/** 0, 60, 120, ... 300 度(rad)のボタン一覧 */
const ANGLES_DEG = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

/**
 * face action の挙動確認
 *
 * - ボタンで指定角度(deg 表示、内部は rad)へ向きを切替える
 * - durationMs スライダーで所要時間を指定する(0 で瞬時)
 * - `rotationY`(= yaw 0 の基準)は world +z。実際に画面上どちらを向いて見えるかを
 *   確認する用途（stage 上のセル移動方向 → yaw の対応付けの検証に使う）
 */
export const Face: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { face } = useBoxBotActionDispatcher(eventTarget)
    const [durationMs, setDurationMs] = React.useState(0)

    return (
      <div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            position: 'relative',
            width: 480,
            zIndex: 10,
          }}
        >
          {ANGLES_DEG.map((deg) => (
            <Button
              key={deg}
              onClick={() =>
                void face({ durationMs, rad: (deg * Math.PI) / 180 })
              }
              type="button"
              variant="outline"
            >
              {deg}°
            </Button>
          ))}
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            durationMs {durationMs}
            <input
              max={1000}
              min={0}
              onChange={(e) => setDurationMs(Number(e.target.value))}
              step={50}
              type="range"
              value={durationMs}
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
