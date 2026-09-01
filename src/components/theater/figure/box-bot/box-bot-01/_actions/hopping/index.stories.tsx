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
 * hopping action の挙動・パラメータ調節
 *
 * - Hop ボタンで待機演出(連続ジャンプ)を on/off トグル。active 中は `intervalSec`
 *   ごとに jump の見た目が再生される
 * - 倒れ姿勢中(Fall 実行中)はトグル無効かつ停止。get-up で直立に戻ると自動再開する
 * - intervalSec スライダーは `actionConfig.hopping` で既定を差し替えて確認する
 */
export const Hopping: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall, hopping } = useBoxBotActionDispatcher(eventTarget)
    const [intervalSec, setIntervalSec] = React.useState(2.5)

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
            onClick={() => void hopping()}
            type="button"
            variant="outline"
          >
            Hop
          </Button>
          <Button onClick={() => void fall()} type="button" variant="outline">
            Fall
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            interval {intervalSec.toFixed(2)} s
            <input
              max={4}
              min={0.5}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              step={0.1}
              type="range"
              value={intervalSec}
            />
          </label>
        </div>
        <BoxBot
          actionConfig={{ hopping: { intervalSec } }}
          eventTarget={eventTarget}
          style={{ marginLeft: 200, marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
