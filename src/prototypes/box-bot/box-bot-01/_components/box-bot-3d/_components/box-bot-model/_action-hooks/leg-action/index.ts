import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { useEventListener } from '@/hooks/event'

import { approach } from '../../../../_lib/approach'
import {
  ACTION_MARCHING_TOGGLE,
  ACTION_WALKING_TOGGLE,
  LEG_BOB_HEIGHT,
  LEG_CYCLE_SEC,
  LEG_SPEED_APPROACH_RATE,
  LEG_SWING_ANGLE,
  WALK_APPROACH_RATE,
} from '../../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../../index.types'

/** 角速度がこの値を下回ったら停止とみなし、角度を直接 0 へ戻す(rad/sec) */
const STOP_SPEED_THRESHOLD = 0.05

/**
 * 歩いている状態(walking)の toggle action の発火・購読・毎フレーム制御(脚 swing)
 *
 * - 姿勢(`postureRef`)が直立(0)でない間は toggle 自体を無視する(倒れている間は歩行開始不可)
 * - `walkingRef.current` の on/off で角速度の目標値を切替え、`approach` で滑らかに\
 *   近づける。これにより開始時は加速、停止時は減速しながら周期運動する
 * - 角速度が `STOP_SPEED_THRESHOLD` を下回ったら位相追従をやめ、角度 0 へ直接 `approach` する。\
 *   sin 波の途中の角度で停止すると脚が斜めのまま静止してしまうため
 *
 * @param props BoxBotModel に渡される props
 */
export const useWalkingAction = (
  props: Pick<BoxBotModelProps, 'interactive' | 'legCycle'>,
): Pick<UseBoxBotModelReturn, 'walkingRef'> => {
  const { interactive = true, legCycle = LEG_CYCLE_SEC } = props

  const { leftLegRef, postureRef, rightLegRef, walkingRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()
  const phaseRef = React.useRef(0)
  const speedRef = React.useRef(0)

  const toggleAction = () => {
    if (!interactive) return
    if (postureRef.current !== 0) return
    walkingRef.current = !walkingRef.current
  }

  useEventListener(ACTION_WALKING_TOGGLE, toggleAction, {
    target: eventTarget,
  })

  useFrame((_, dt) => {
    if (!leftLegRef.current || !rightLegRef.current) return

    const targetSpeed = walkingRef.current ? (2 * Math.PI) / legCycle : 0
    speedRef.current = approach(
      speedRef.current,
      targetSpeed,
      LEG_SPEED_APPROACH_RATE,
      dt,
    )

    if (walkingRef.current || speedRef.current > STOP_SPEED_THRESHOLD) {
      phaseRef.current += speedRef.current * dt
      leftLegRef.current.rotation.x =
        Math.sin(phaseRef.current) * LEG_SWING_ANGLE
      rightLegRef.current.rotation.x =
        Math.sin(phaseRef.current + Math.PI) * LEG_SWING_ANGLE
      return
    }

    phaseRef.current = 0
    leftLegRef.current.rotation.x = approach(
      leftLegRef.current.rotation.x,
      0,
      WALK_APPROACH_RATE,
      dt,
    )
    rightLegRef.current.rotation.x = approach(
      rightLegRef.current.rotation.x,
      0,
      WALK_APPROACH_RATE,
      dt,
    )
  })

  return { walkingRef }
}

/**
 * 足踏みしている状態(marching)の toggle action の発火・購読・毎フレーム制御(脚 bob)
 *
 * - 姿勢(`postureRef`)が直立(0)でない間は toggle 自体を無視する(倒れている間は足踏み開始不可)
 * - `marchingRef.current` の間のみ動作する。それ以外は base 位置(`legY`)へ\
 *   `approach` で滑らかに戻す
 *
 * @param props BoxBotModel に渡される props
 * @param legY 脚グループの base y 座標(付け根)
 */
export const useMarchingAction = (
  props: Pick<BoxBotModelProps, 'interactive' | 'legCycle'>,
  legY: number,
): Pick<UseBoxBotModelReturn, 'marchingRef'> => {
  const { interactive = true, legCycle = LEG_CYCLE_SEC } = props

  const { leftLegRef, marchingRef, postureRef, rightLegRef } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()
  const phaseRef = React.useRef(0)

  const toggleAction = () => {
    if (!interactive) return
    if (postureRef.current !== 0) return
    marchingRef.current = !marchingRef.current
  }

  useEventListener(ACTION_MARCHING_TOGGLE, toggleAction, {
    target: eventTarget,
  })

  useFrame((_, dt) => {
    if (!leftLegRef.current || !rightLegRef.current) return

    if (marchingRef.current) {
      phaseRef.current += dt * ((2 * Math.PI) / legCycle)
      leftLegRef.current.position.y =
        legY + Math.sin(phaseRef.current) * LEG_BOB_HEIGHT
      rightLegRef.current.position.y =
        legY + Math.sin(phaseRef.current + Math.PI) * LEG_BOB_HEIGHT
      return
    }

    phaseRef.current = 0
    leftLegRef.current.position.y = approach(
      leftLegRef.current.position.y,
      legY,
      WALK_APPROACH_RATE,
      dt,
    )
    rightLegRef.current.position.y = approach(
      rightLegRef.current.position.y,
      legY,
      WALK_APPROACH_RATE,
      dt,
    )
  })

  return { marchingRef }
}
