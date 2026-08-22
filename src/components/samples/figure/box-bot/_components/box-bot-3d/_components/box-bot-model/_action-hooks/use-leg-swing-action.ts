import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { approach } from '../../../_lib/approach'
import {
  LEG_CYCLE_SEC,
  LEG_SPEED_APPROACH_RATE,
  LEG_SWING_ANGLE,
  WALK_APPROACH_RATE,
} from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/** 角速度がこの値を下回ったら停止とみなし、角度を直接 0 へ戻す(rad/sec) */
const STOP_SPEED_THRESHOLD = 0.05

/**
 * 歩行(walking)中の脚 swing(付け根を支点にした左右逆位相の前後スイング)
 *
 * - `walkingRef.current` の on/off で角速度の目標値を切替え、`approach` で滑らかに\
 *   近づける。これにより開始時は加速、停止時は減速しながら周期運動する
 * - 角速度が `STOP_SPEED_THRESHOLD` を下回ったら位相追従をやめ、角度 0 へ直接 `approach` する。\
 *   sin 波の途中の角度で停止すると脚が斜めのまま静止してしまうため
 *
 * @param props BoxBotModel に渡される props
 */
export const useLegSwingAction = (
  props: Pick<BoxBotModelProps, 'legCycle'>,
): void => {
  const { legCycle = LEG_CYCLE_SEC } = props

  const { leftLegRef, rightLegRef, walkingRef } = useBoxBotRefs()
  const phaseRef = React.useRef(0)
  const speedRef = React.useRef(0)

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
}
