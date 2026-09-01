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
 * body-bobbing action の挙動・パラメータ調節
 *
 * - dispatch は無い。Walk / March トグル中に体全体が上下する (歩幅・足踏みの位相に同期)。\
 *   止めると体の高さが 0 へ戻る
 * - height スライダーは `actionConfig.bodyBobbing` で最大持ち上げ量を差し替えて確認する
 * - Fall との併用で体の pivot・倒れ込みが破綻しないことも見る
 */
export const BodyBobbing: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall, marching, walking } = useBoxBotActionDispatcher(eventTarget)
    const [height, setHeight] = React.useState(0.025)

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
          <Button
            onClick={() => void marching()}
            type="button"
            variant="outline"
          >
            March
          </Button>
          <Button onClick={() => void fall()} type="button" variant="outline">
            Fall
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            height {height.toFixed(3)}
            <input
              max={0.15}
              min={0}
              onChange={(e) => setHeight(Number(e.target.value))}
              step={0.005}
              type="range"
              value={height}
            />
          </label>
        </div>
        <BoxBot
          actionConfig={{ bodyBobbing: { height } }}
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginLeft: 200, marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
