import { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'

import { Button } from '@/components/ui/button'

import BoxBot, { CAMERA_POSITION, ORBIT_TARGET } from '../..'

import { ACTION_FALL } from './config'

const meta: Meta<typeof BoxBot> = {
  component: BoxBot,
}

export default meta
type Story = StoryObj<typeof BoxBot>

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
              <BoxBot
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
