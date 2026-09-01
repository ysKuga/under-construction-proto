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
 * walking action の挙動・パラメータ調節
 *
 * - Walk ボタンで歩行を on/off トグル。脚が付け根支点で前後に swing する。\
 *   開始で加速、停止で減速し、止まると脚角が 0 へ戻る
 * - swingAngle / cycleSec スライダーは `actionConfig.walking` で既定を差し替えて確認する\
 *   (persist する設定のため dispatch の override は持たない)
 * - 倒れ姿勢中(Fall 実行中)はトグルが無効。脚の rotation.x のみで表示領域は動かない
 */
export const Walking: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall, walking } = useBoxBotActionDispatcher(eventTarget)
    const [swingAngle, setSwingAngle] = React.useState(0.5)
    const [cycleSec, setCycleSec] = React.useState(1)

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
            onClick={() => void walking()}
            type="button"
            variant="outline"
          >
            Walk
          </Button>
          <Button onClick={() => void fall()} type="button" variant="outline">
            Fall
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            swing {swingAngle.toFixed(2)} rad
            <input
              max={1.2}
              min={0}
              onChange={(e) => setSwingAngle(Number(e.target.value))}
              step={0.05}
              type="range"
              value={swingAngle}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            cycle {cycleSec.toFixed(2)} s
            <input
              max={2}
              min={0.3}
              onChange={(e) => setCycleSec(Number(e.target.value))}
              step={0.05}
              type="range"
              value={cycleSec}
            />
          </label>
        </div>
        <BoxBot
          actionConfig={{ walking: { cycleSec, swingAngle } }}
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginLeft: 200, marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
