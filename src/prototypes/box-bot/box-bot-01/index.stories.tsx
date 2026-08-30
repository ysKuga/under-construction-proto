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

/** 胴クリックでジャンプ / 頭クリックでスピン(既定の clickBindings) */
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

/**
 * fall action の挙動・パラメータ調節
 *
 * - Fall / Get up ボタンで姿勢をトグル(`fall({ shiftX, shiftY })` dispatch)。直立なら転倒、\
 *   横倒しなら起き上がり。Canvas 内は体心まわりの前傾のみ
 * - #108 フェーズ1: 「倒れ込み」の移動は表示領域(Canvas ラッパー)の DOM ずらしで表現。\
 *   スライダーで画面右(x)・上(y)方向のずらし量(px、負で左/下)を実測する。\
 *   jump と同じく設置領域(赤枠)を Canvas がはみ出す
 */
export const Fall: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall } = useBoxBotActionDispatcher(eventTarget)
    const [shiftX, setShiftX] = React.useState(-40)
    const [shiftY, setShiftY] = React.useState(-70)

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
            onClick={() => void fall({ shiftX, shiftY })}
            type="button"
            variant="outline"
          >
            Fall / Get up
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            x {shiftX}px
            <input
              max={200}
              min={-200}
              onChange={(e) => setShiftX(Number(e.target.value))}
              step={10}
              type="range"
              value={shiftX}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            y {shiftY}px
            <input
              max={200}
              min={-200}
              onChange={(e) => setShiftY(Number(e.target.value))}
              step={10}
              type="range"
              value={shiftY}
            />
          </label>
        </div>
        {/* 転倒で Canvas が設置領域を左下へはみ出すため、story viewport 左端で
            切れないよう右へ寄せる(スライダー min -200 でも収まる余白) */}
        <StoryComponent
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginLeft: 260, marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}

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
        <StoryComponent
          eventTarget={eventTarget}
          shadowOpacity={0}
          style={{ marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}
