import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { approach } from '../../../_lib/approach'
import {
  LEG_CYCLE_SEC,
  LEG_SWING_ANGLE,
  WALK_APPROACH_RATE,
} from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * 歩行中の脚 swing(付け根を支点にした左右逆位相の前後スイング)
 *
 * - `legMotion === 'swing'` かつ `walkingRef.current` の間のみ動作する。それ以外は\
 *   角度 0 へ `approach` で滑らかに戻す
 *
 * @param props BoxBotModel に渡される props
 */
export const useLegSwingAction = (
  props: Pick<BoxBotModelProps, 'legCycle' | 'legMotion'>,
): void => {
  const { legCycle = LEG_CYCLE_SEC, legMotion } = props

  const { leftLegRef, rightLegRef, walkingRef } = useBoxBotRefs()
  const phaseRef = React.useRef(0)

  useFrame((_, dt) => {
    if (!leftLegRef.current || !rightLegRef.current) return

    const active = legMotion === 'swing' && walkingRef.current
    if (active) {
      phaseRef.current += dt * ((2 * Math.PI) / legCycle)
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
