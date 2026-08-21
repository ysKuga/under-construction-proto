'use client'

import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as React from 'react'
import type { Group } from 'three'

import { approach } from '../../_lib/approach'

import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  Handlers,
  UseBoxBotModelReturn,
} from './index.types'

const DEFAULTS: BoxBot3DConfig = {
  arm: {
    d: 0.18,
    leftAngle: -0.5,
    leftLen: 1.15,
    rightAngle: 2.4,
    rightLen: 1.0,
    w: 0.18,
  },
  body: { d: 1.4, h: 1.7, w: 2.0 },
  eye: { d: 0.06, h: 0.34, offset: 0.42, w: 0.06 },
  head: { d: 1.2, h: 1.0, w: 1.6 },
  ink: '#191B21',
  leg: { d: 0.22, gap: 0.5, h: 0.5, w: 0.22 },
  lineWidth: 2.5,
  outline: true,
  outlineWidth: 0.03,
  paper: '#FBFAF6',
  seed: 7,
  sketch: 0.035,
  sketchDetail: 7,
}

/** ホップ(ジャンプ)の継続時間(秒) */
const HOP_DUR = 0.55
/** ホップの最大上昇量(world) */
const HOP_H = 0.55
/** ホップ中の縦方向のスクイッシュ量 */
const HOP_SQUASH_Y = 0.08
/** ホップ中の横方向のスクイッシュ量 */
const HOP_SQUASH_X = 0.05

/** leftUp = true(上げ)時の左腕角度(z 軸回転) */
const ARM_UP_ANGLE = -2.25
/** rightUp = false(下げ)時の右腕角度(z 軸回転) */
const ARM_DOWN_ANGLE = 0.5
/** 腕の角度が目標値へ近づく速さ(approach の減衰係数) */
const ARM_APPROACH_RATE = 9

/** 胴体上端から頭下端までの隙間(world) */
const HEAD_GAP = 0.1
/** 肩の y 位置。胴体上端からのオフセット(world) */
const SHOULDER_Y_OFFSET = 0.2
/** 頭前面から目・口を浮かせる量(world、z-fighting 回避) */
const HEAD_FRONT_MARGIN = 0.01

/** BoxBotModel のロジック(設定マージ・ref・アニメーション制御) */
export function useBoxBotModel({
  autoRotate = false,
  interactive = true,
  rotateSpeed = 0,
  ...opts
}: BoxBotModelProps): UseBoxBotModelReturn {
  const cfg: BoxBot3DConfig = {
    ...DEFAULTS,
    ...opts,
    arm: { ...DEFAULTS.arm, ...opts.arm },
    body: { ...DEFAULTS.body, ...opts.body },
    eye: { ...DEFAULTS.eye, ...opts.eye },
    head: { ...DEFAULTS.head, ...opts.head },
    leg: { ...DEFAULTS.leg, ...opts.leg },
  }

  const root = React.useRef<Group>(null)
  const spin = React.useRef<Group>(null)
  const leftArm = React.useRef<Group>(null)
  const rightArm = React.useRef<Group>(null)
  const hop = React.useRef(-1)

  const [leftUp, setLeftUp] = React.useState(false)
  const [rightUp, setRightUp] = React.useState(false)

  const setCursor = (v: string) => {
    if (typeof document !== 'undefined') document.body.style.cursor = v
  }
  const hover: Handlers = interactive
    ? {
        onPointerOut: () => setCursor('auto'),
        onPointerOver: (e) => {
          e.stopPropagation()
          setCursor('pointer')
        },
      }
    : {}

  const startHop = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (hop.current < 0) hop.current = 0
  }
  const toggleLeft = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setLeftUp((v) => !v)
  }
  const toggleRight = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setRightUp((v) => !v)
  }

  // leftUp/rightUp 状態に応じた腕の目標角度
  const leftArmAngle = leftUp ? ARM_UP_ANGLE : cfg.arm.leftAngle
  const rightArmAngle = rightUp ? cfg.arm.rightAngle : ARM_DOWN_ANGLE

  // マウント時のみ初期角度を反映する。rotation を JSX prop として渡すと
  // toggle のたびに再レンダリングで直接上書きされ、useFrame の approach による
  // 補間より先に目標角度へジャンプしてしまう(瞬間切り替わりの原因)ため、
  // 初期表示だけここで済ませ、以降は useFrame のみで更新する
  React.useLayoutEffect(() => {
    if (leftArm.current) leftArm.current.rotation.z = leftArmAngle
    if (rightArm.current) rightArm.current.rotation.z = rightArmAngle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 自動回転・腕の角度・ホップ(ジャンプ)アニメーションを毎フレーム更新
  useFrame((_, dt) => {
    if (autoRotate && spin.current) spin.current.rotation.y += rotateSpeed * dt

    if (leftArm.current)
      leftArm.current.rotation.z = approach(
        leftArm.current.rotation.z,
        leftArmAngle,
        ARM_APPROACH_RATE,
        dt,
      )
    if (rightArm.current)
      rightArm.current.rotation.z = approach(
        rightArm.current.rotation.z,
        rightArmAngle,
        ARM_APPROACH_RATE,
        dt,
      )

    if (root.current) {
      let sx = 1,
        sy = 1,
        y = 0
      if (hop.current >= 0) {
        hop.current += dt
        if (hop.current >= HOP_DUR) {
          hop.current = -1
        } else {
          const p = hop.current / HOP_DUR
          y = Math.sin(p * Math.PI) * HOP_H
          sy = 1 + HOP_SQUASH_Y * Math.sin(p * Math.PI * 2)
          sx = 1 - HOP_SQUASH_X * Math.sin(p * Math.PI * 2)
        }
      }
      root.current.position.y = y
      root.current.scale.set(sx, sy, sx)
    }
  })

  const bodyTop = cfg.body.h / 2
  const headY = bodyTop + HEAD_GAP + cfg.head.h / 2
  const headFront = cfg.head.d / 2 + HEAD_FRONT_MARGIN
  const shoulderY = bodyTop - SHOULDER_Y_OFFSET
  const shoulderX = cfg.body.w / 2
  const legY = -bodyTop - cfg.leg.h / 2
  const legX = (cfg.body.w / 2) * cfg.leg.gap

  return {
    cfg,
    headFront,
    headY,
    hover,
    interactive,
    leftArm,
    legX,
    legY,
    rightArm,
    root,
    shoulderX,
    shoulderY,
    spin,
    startHop,
    toggleLeft,
    toggleRight,
  }
}
