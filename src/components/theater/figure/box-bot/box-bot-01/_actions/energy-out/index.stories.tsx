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
 * energyOut action の挙動・パラメータ調節
 *
 * - EnergyOut ボタンでトグル発火(直立 → 予防姿勢、予防姿勢中なら復帰)。スライダーで
 *   上半身の前傾角度(°)・腕を体側へ寄せる量(°、既定 0 は静的な肩の開きをそのまま残す)を
 *   変え、dispatch の override 引数(`energyOut({ armLift, tiltAngle })`)として渡す
 * - issue #181: EN 切れは経路実行中に検知できる(想定内の停止)ため、fall(不意の転倒)とは
 *   別の「転倒を防ぐための予防姿勢・動力を使わない安定した姿勢」を表す。脚は接地したまま
 *   腰を支点に上半身だけ前傾する(fall はシルエット中心軸で脚を含む全身が傾く)
 */
export const EnergyOut: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { energyOut } = useBoxBotActionDispatcher(eventTarget)
    const [tiltAngleDeg, setTiltAngleDeg] = React.useState(18)
    const [armLiftDeg, setArmLiftDeg] = React.useState(0)

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
            onClick={() =>
              void energyOut({
                armLift: (armLiftDeg * Math.PI) / 180,
                tiltAngle: (tiltAngleDeg * Math.PI) / 180,
              })
            }
            type="button"
            variant="outline"
          >
            EnergyOut
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            tiltAngle {tiltAngleDeg}°
            <input
              max={45}
              min={0}
              onChange={(e) => setTiltAngleDeg(Number(e.target.value))}
              step={1}
              type="range"
              value={tiltAngleDeg}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            armLift {armLiftDeg}°
            <input
              max={60}
              min={0}
              onChange={(e) => setArmLiftDeg(Number(e.target.value))}
              step={1}
              type="range"
              value={armLiftDeg}
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
