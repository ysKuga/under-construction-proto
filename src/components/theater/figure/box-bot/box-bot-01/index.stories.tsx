import { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import { ACTION_FALL } from './_actions/fall'
import { useBoxBotActionDispatcher } from './_components/box-bot-model/use-box-bot-action-dispatcher'

import StoryComponent, { CAMERA_POSITION, ORBIT_TARGET } from '.'

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
 * カメラに正対する facing (rad)
 *
 * - `rotationY = 0` は world +z 向きだが、カメラは斜め上・斜め右から見るため画面上は斜めを向く。
 *   bot → カメラの水平ベクトルの yaw を使い、画面に正対 (顔をカメラへ真っ直ぐ) させる
 */
const FACE_CAMERA_YAW = Math.atan2(
  CAMERA_POSITION[0] - ORBIT_TARGET[0],
  CAMERA_POSITION[2] - ORBIT_TARGET[2],
)

/**
 * Fall story の 3x3 配置
 *
 * - 周囲 8 セルは 8 方向、`deg` はカメラ正対からのオフセット。セルの方角と bot の向き
 *   (倒れ込む向き)を一致させる。`orbit: false` で視点固定(回転抑止)
 * - 中央セルは `orbit: true`。マウスドラッグでカメラを回して立体を確認する用
 */
const FALL_FACING_GRID = [
  { col: 1, deg: 225, orbit: false, row: 1 },
  { col: 2, deg: 180, orbit: false, row: 1 },
  { col: 3, deg: 135, orbit: false, row: 1 },
  { col: 1, deg: 270, orbit: false, row: 2 },
  { col: 2, deg: 0, orbit: true, row: 2 },
  { col: 3, deg: 90, orbit: false, row: 2 },
  { col: 1, deg: 315, orbit: false, row: 3 },
  { col: 2, deg: 0, orbit: false, row: 3 },
  { col: 3, deg: 45, orbit: false, row: 3 },
]

/**
 * fall action の挙動・パラメータ調節(8 方向を 3x3 で同時比較)
 *
 * - 周囲 8 体は 3x3 の外周セルへ配置、各 bot は自セルの方角を向く(`rotationY` はカメラ
 *   正対から 45° 刻み)。`orbit: false` で視点固定 = 倒れ込み方向を同条件で比較できる
 * - 中央 1 体は `orbit: true` でマウスドラッグ回転可。立体の確認用
 * - bot ごとに独立した `eventTarget`(共有すると listener 多重登録でエラー)
 * - Fall / Get up ボタン 1 回で全体へ同時に `ACTION_FALL` を dispatch。倒れ込み方向が
 *   セルの外側(その方角)へ向くことを確認する
 * - #108 フェーズ1: 「倒れ込み」の移動は表示領域(Canvas ラッパー)の DOM ずらしで表現。\
 *   shiftDistance スライダーで facing 方向へのずらし距離(px)、dropDistance スライダーで
 *   横倒し時に足元が浮くぶんの下げ量(px)を実測する。全体共通の値を dispatch する
 * - armAngle スライダーで転倒時に腕を頭側へ引き寄せる角度(°、x 軸回転)を実測する。\
 *   静的な肩の開き(`cfg.arm.*Angle`)と合成されるため、肩の開きを変えたら再調整する
 */
export const Fall: Story = {
  parameters: {
    options: { showPanel: false },
  },
  render: () => {
    const [targets] = React.useState(() =>
      FALL_FACING_GRID.map(() => new EventTarget()),
    )
    const [shiftDistance, setShiftDistance] = React.useState(55)
    const [dropDistance, setDropDistance] = React.useState(25)
    const [armAngleDeg, setArmAngleDeg] = React.useState(-180)

    const fallAll = () => {
      for (const target of targets) {
        target.dispatchEvent(
          new CustomEvent(ACTION_FALL, {
            detail: {
              armAngle: (armAngleDeg * Math.PI) / 180,
              dropDistance,
              shiftDistance,
            },
          }),
        )
      }
    }

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
          <Button onClick={fallAll} type="button" variant="outline">
            Fall / Get up(9 体同時)
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
          <label style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
            armAngle {armAngleDeg}°
            <input
              max={0}
              min={-180}
              onChange={(e) => setArmAngleDeg(Number(e.target.value))}
              step={5}
              type="range"
              value={armAngleDeg}
            />
          </label>
        </div>
        {/* 3x3。1 マス = bot 既定サイズ。左列が転倒で見切れないよう左に余白 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 234px)',
            gridTemplateRows: 'repeat(3, 234px)',
            marginLeft: 200,
            marginTop: 40,
          }}
        >
          {FALL_FACING_GRID.map((cell, i) => (
            <div
              key={`${cell.col}-${cell.row}`}
              style={{ gridColumn: `${cell.col}`, gridRow: `${cell.row}` }}
            >
              <StoryComponent
                eventTarget={targets[i]}
                orbit={cell.orbit}
                rotationY={FACE_CAMERA_YAW + (cell.deg * Math.PI) / 180}
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
