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

const HOP_DUR = 0.55
const HOP_H = 0.55

/** BoxBotModel のロジック(設定マージ・ref・アニメーション制御) */
export function useBoxBotModel({
  autoRotate = false,
  interactive = true,
  rotateSpeed = 0.4,
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

  // leftUp/rightUp 状態に応じた腕の目標角度。JSX の初期 rotation とも共有し、
  // 表示直後に目標角度へアニメーションしてしまう(初期値とのズレ)のを防ぐ
  const leftArmAngle = leftUp ? -2.25 : cfg.arm.leftAngle
  const rightArmAngle = rightUp ? cfg.arm.rightAngle : 0.5

  // 自動回転・腕の角度・ホップ(ジャンプ)アニメーションを毎フレーム更新
  useFrame((_, dt) => {
    if (autoRotate && spin.current) spin.current.rotation.y += rotateSpeed * dt

    if (leftArm.current)
      leftArm.current.rotation.z = approach(
        leftArm.current.rotation.z,
        leftArmAngle,
        9,
        dt,
      )
    if (rightArm.current)
      rightArm.current.rotation.z = approach(
        rightArm.current.rotation.z,
        rightArmAngle,
        9,
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
          sy = 1 + 0.08 * Math.sin(p * Math.PI * 2)
          sx = 1 - 0.05 * Math.sin(p * Math.PI * 2)
        }
      }
      root.current.position.y = y
      root.current.scale.set(sx, sy, sx)
    }
  })

  const bodyTop = cfg.body.h / 2
  const headY = bodyTop + 0.1 + cfg.head.h / 2
  const headFront = cfg.head.d / 2 + 0.01
  const shoulderY = bodyTop - 0.2
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
    leftArmAngle,
    legX,
    legY,
    rightArm,
    rightArmAngle,
    root,
    shoulderX,
    shoulderY,
    spin,
    startHop,
    toggleLeft,
    toggleRight,
  }
}
