'use client'

import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { approach } from '../../_lib/approach'

import { useArmAction } from './_action-hooks/arm-action'
import { useBodyBobbingAction } from './_action-hooks/use-body-bobbing-action'
import { useFallAction } from './_action-hooks/use-fall-action'
import { useGetUpAction } from './_action-hooks/use-get-up-action'
import { useJumpAction } from './_action-hooks/use-jump-action'
import { useLegBobAction } from './_action-hooks/use-leg-bob-action'
import { useLegSwingAction } from './_action-hooks/use-leg-swing-action'
import { useMarchingAction } from './_action-hooks/use-marching-action'
import { useWalkingAction } from './_action-hooks/use-walking-action'
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
    autoWalk,
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

  const {
    fallPivotRef,
    jumpRef,
    leftArmRef,
    leftLegRef,
    postureRef,
    rightArmRef,
    rightLegRef,
    rootRef,
    spinRef,
    walkingBobRef,
  } = useBoxBotRefs()

  const bodyTop = cfg.body.h / 2
  const legY = -bodyTop
  const groundY = legY - cfg.leg.h

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
  const { startFall } = useFallAction(props)
  const { startGetUp } = useGetUpAction(props)
  const { arm } = useArmAction(props)
  const { walkingRef } = useWalkingAction(props)
  const { marchingRef } = useMarchingAction(props)
  useLegBobAction(props, legY)
  useLegSwingAction(props)
  useBodyBobbingAction(props, legY)

  // マウント時に autoWalk の歩き方で歩き始める。useBoxBotActionDispatcher 経由の
  // toggle は Canvas 外部からの発行になり、初回マウント直後は listener 登録前に
  // イベントが発行されるタイミング競合の余地があるため、ref を直接セットする
  React.useLayoutEffect(() => {
    if (autoWalk === 'swing') walkingRef.current = true
    else if (autoWalk === 'bob') marchingRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const headY = bodyTop + HEAD_GAP + cfg.head.h / 2
  const headFront = cfg.head.d / 2 + HEAD_FRONT_MARGIN
  const shoulderY = bodyTop - SHOULDER_Y_OFFSET
  const shoulderX = cfg.body.w / 2
  const legX = (cfg.body.w / 2) * cfg.leg.gap

  return {
    arm,
    cfg,
    fallPivotRef,
    groundY,
    headFront,
    headY,
    hover,
    interactive,
    jumpRef,
    leftArmRef,
    leftLegRef,
    legX,
    legY,
    marchingRef,
    postureRef,
    rightArmRef,
    rightLegRef,
    rootRef,
    shoulderX,
    shoulderY,
    spinRef,
    startFall,
    startGetUp,
    startJump,
    walkingBobRef,
    walkingRef,
  }
}
