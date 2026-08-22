import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { approach } from '../../../_lib/approach'
import {
  LEG_BOB_HEIGHT,
  LEG_CYCLE_SEC,
  WALK_APPROACH_RATE,
} from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * 足踏み(marching)中の脚 bob(左右逆位相の上下)
 *
 * - `marchingRef.current` の間のみ動作する。それ以外は base 位置(`legY`)へ\
 *   `approach` で滑らかに戻す
 *
 * @param props BoxBotModel に渡される props
 * @param legY 脚グループの base y 座標(付け根)
 */
export const useLegBobAction = (
  props: Pick<BoxBotModelProps, 'legCycle'>,
  legY: number,
): void => {
  const { legCycle = LEG_CYCLE_SEC } = props

  const { leftLegRef, marchingRef, rightLegRef } = useBoxBotRefs()
  const phaseRef = React.useRef(0)

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
}
