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
 * - Fall / Get up ボタンで姿勢をトグル(`fall({ shiftDistance, dropDistance })` dispatch)。\
 *   直立なら転倒、横倒しなら起き上がり。Canvas 内はシルエット中心まわりの前傾のみ
 * - #108 フェーズ1: 「倒れ込み」の移動は表示領域(Canvas ラッパー)の DOM ずらしで表現。\
 *   倒れ込む向きは bot の向き(facing、`rotationY`)から算出する。facing スライダーで\
 *   bot を回し、shiftDistance スライダーでずらし距離(px)を実測する。\
 *   dropDistance スライダーで横倒し時に足元が浮くぶんの下げ量(px)を実測する。\
 *   jump と同じく設置領域(赤枠)を Canvas がはみ出す
 */
export const Fall: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall } = useBoxBotActionDispatcher(eventTarget)
    const [facingDeg, setFacingDeg] = React.useState(0)
    const [shiftDistance, setShiftDistance] = React.useState(80)
    const [dropDistance, setDropDistance] = React.useState(60)

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
            onClick={() => void fall({ dropDistance, shiftDistance })}
            type="button"
            variant="outline"
          >
            Fall / Get up
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            facing {facingDeg}°
            <input
              max={180}
              min={-180}
              onChange={(e) => setFacingDeg(Number(e.target.value))}
              step={15}
              type="range"
              value={facingDeg}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            shiftDistance {shiftDistance}px
            <input
              max={200}
              min={0}
              onChange={(e) => setShiftDistance(Number(e.target.value))}
              step={10}
              type="range"
              value={shiftDistance}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            dropDistance {dropDistance}px
            <input
              max={200}
              min={0}
              onChange={(e) => setDropDistance(Number(e.target.value))}
              step={10}
              type="range"
              value={dropDistance}
            />
          </label>
        </div>
        {/* 転倒で Canvas が設置領域をはみ出すため、story viewport 端で
            切れないよう余白を取る(facing により倒れ込む向きが変わる) */}
        <StoryComponent
          eventTarget={eventTarget}
          rotationY={(facingDeg * Math.PI) / 180}
          shadowOpacity={0}
          style={{ marginLeft: 260, marginTop: 160, outline: '1px solid red' }}
        />
      </div>
    )
  },
}

/** Fall バリアント story で並べる bot の向き */
const FALL_FACING_VARIANTS = [
  { deg: 0, label: '正面 (0°)' },
  { deg: 180, label: '背面 (180°)' },
  { deg: 90, label: '右向き (90°)' },
]

/**
 * fall の倒れ込み方向を複数の向きで同時比較
 *
 * - bot を 3 体並べ、それぞれ `rotationY`(facing)を正面 / 背面 / 右向きに固定。\
 *   全体で 1 つの `eventTarget` を共有するため、Fall ボタン 1 回で 3 体が同時に転倒 / 起き上がる
 * - facing ごとに画面上の倒れ込み方向が変わることを確認する。shiftDistance / dropDistance は
 *   3 体共通で dispatch する
 */
export const FallFacingVariants: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [eventTarget] = React.useState(() => new EventTarget())
    const { fall } = useBoxBotActionDispatcher(eventTarget)
    const [shiftDistance, setShiftDistance] = React.useState(80)
    const [dropDistance, setDropDistance] = React.useState(60)

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
            onClick={() => void fall({ dropDistance, shiftDistance })}
            type="button"
            variant="outline"
          >
            Fall / Get up(3 体同時)
          </Button>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            shiftDistance {shiftDistance}px
            <input
              max={200}
              min={0}
              onChange={(e) => setShiftDistance(Number(e.target.value))}
              step={10}
              type="range"
              value={shiftDistance}
            />
          </label>
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            dropDistance {dropDistance}px
            <input
              max={200}
              min={0}
              onChange={(e) => setDropDistance(Number(e.target.value))}
              step={10}
              type="range"
              value={dropDistance}
            />
          </label>
        </div>
        {/* 各 bot の Canvas が転倒で四方へはみ出すため、間隔・余白を広めに取る */}
        <div
          style={{ display: 'flex', gap: 160, marginLeft: 200, marginTop: 220 }}
        >
          {FALL_FACING_VARIANTS.map((variant) => (
            <div key={variant.deg} style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 8 }}>{variant.label}</div>
              <StoryComponent
                eventTarget={eventTarget}
                rotationY={(variant.deg * Math.PI) / 180}
                shadowOpacity={0}
                style={{ outline: '1px solid red' }}
              />
            </div>
          ))}
        </div>
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
