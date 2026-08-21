'use client'

import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as React from 'react'
import type { Group } from 'three'

import { approach } from '../../_lib/approach'

import { useJumpAction } from './_action-hooks/use-jump-action'
import {
  ARM_APPROACH_RATE,
  ARM_DOWN_ANGLE,
  ARM_UP_ANGLE,
  DEFAULTS,
  HEAD_FRONT_MARGIN,
  HEAD_GAP,
  HOP_DUR,
  HOP_H,
  HOP_SQUASH_X,
  HOP_SQUASH_Y,
  SHOULDER_Y_OFFSET,
} from './index.constants'
import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  Handlers,
  UseBoxBotModelReturn,
} from './index.types'

/** BoxBotModel のロジック(設定マージ・ref・アニメーション制御) */
export function useBoxBotModel(
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): UseBoxBotModelReturn {
  const {
    autoRotate = false,
    interactive = true,
    rotateSpeed = 0,
    ...opts
  } = props

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

  const { hopRef, startHop } = useJumpAction(props)

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
      if (hopRef.current >= 0) {
        hopRef.current += dt
        if (hopRef.current >= HOP_DUR) {
          hopRef.current = -1
        } else {
          const p = hopRef.current / HOP_DUR
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
    hopRef,
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
