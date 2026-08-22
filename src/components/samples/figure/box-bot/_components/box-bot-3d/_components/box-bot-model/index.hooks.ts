'use client'

import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { approach } from '../../_lib/approach'

import { useArmAction } from './_action-hooks/arm-action'
import { useJumpAction } from './_action-hooks/use-jump-action'
import {
  ARM_APPROACH_RATE,
  ARM_DOWN_ANGLE,
  ARM_UP_ANGLE,
  DEFAULTS,
  HEAD_FRONT_MARGIN,
  HEAD_GAP,
  SHOULDER_Y_OFFSET,
} from './index.constants'
import { useBoxBotRefs } from './index.contexts'
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

  const { jumpRef, leftArmRef, rightArmRef, rootRef, spinRef } = useBoxBotRefs()

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

  const { startJump } = useJumpAction(props)
  const { arm } = useArmAction(props)

  // arm.left/right.up 状態に応じた腕の目標角度
  const leftArmAngle = arm.left.up ? ARM_UP_ANGLE : cfg.arm.leftAngle
  const rightArmAngle = arm.right.up ? cfg.arm.rightAngle : ARM_DOWN_ANGLE

  // マウント時のみ初期角度を反映する。rotation を JSX prop として渡すと
  // toggle のたびに再レンダリングで直接上書きされ、useFrame の approach による
  // 補間より先に目標角度へジャンプしてしまう(瞬間切り替わりの原因)ため、
  // 初期表示だけここで済ませ、以降は useFrame のみで更新する
  React.useLayoutEffect(() => {
    if (leftArmRef.current) leftArmRef.current.rotation.z = leftArmAngle
    if (rightArmRef.current) rightArmRef.current.rotation.z = rightArmAngle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 自動回転・腕の角度を毎フレーム更新
  useFrame((_, dt) => {
    if (autoRotate && spinRef.current)
      spinRef.current.rotation.y += rotateSpeed * dt

    if (leftArmRef.current)
      leftArmRef.current.rotation.z = approach(
        leftArmRef.current.rotation.z,
        leftArmAngle,
        ARM_APPROACH_RATE,
        dt,
      )
    if (rightArmRef.current)
      rightArmRef.current.rotation.z = approach(
        rightArmRef.current.rotation.z,
        rightArmAngle,
        ARM_APPROACH_RATE,
        dt,
      )
  })

  const bodyTop = cfg.body.h / 2
  const headY = bodyTop + HEAD_GAP + cfg.head.h / 2
  const headFront = cfg.head.d / 2 + HEAD_FRONT_MARGIN
  const shoulderY = bodyTop - SHOULDER_Y_OFFSET
  const shoulderX = cfg.body.w / 2
  const legY = -bodyTop - cfg.leg.h / 2
  const legX = (cfg.body.w / 2) * cfg.leg.gap

  return {
    arm,
    cfg,
    headFront,
    headY,
    hover,
    interactive,
    jumpRef,
    leftArmRef,
    legX,
    legY,
    rightArmRef,
    rootRef,
    shoulderX,
    shoulderY,
    spinRef,
    startJump,
  }
}
