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
 * marching action の挙動・パラメータ調節
 *
 * - March ボタンで足踏みを on/off トグル。左右の脚が逆位相で上下する。\
 *   止めると脚の位置が付け根 base へ戻る
 * - bobHeight / cycleSec スライダーは `actionConfig.marching` で既定を差し替えて確認する
 * - 倒れ姿勢中(Fall 実行中)はトグルが無効。脚の position.y のみで表示領域は動かない
 */
export const Marching: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall, marching } = useBoxBotActionDispatcher(eventTarget)
    const [bobHeight, setBobHeight] = React.useState(0.12)
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
            bob {bobHeight.toFixed(2)}
            <input
              max={0.4}
              min={0}
              onChange={(e) => setBobHeight(Number(e.target.value))}
              step={0.01}
              type="range"
              value={bobHeight}
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
          actionConfig={{ marching: { bobHeight, cycleSec } }}
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
