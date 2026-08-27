import { useFrame } from '@react-three/fiber'
import * as React from 'react'

import { approach } from '../../../../_lib/approach'
import {
  ACTION_ARM_LEFT_TOGGLE,
  ACTION_ARM_RIGHT_TOGGLE,
  ARM_APPROACH_RATE,
  ARM_DOWN_ANGLE,
  ARM_UP_ANGLE,
} from '../../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../../index.contexts'
import type {
  BoxBot3DConfig,
  BoxBotModelProps,
  UseBoxBotModelReturn,
} from '../../index.types'

import { useArmToggle } from './_hooks/use-arm-toggle'

/**
 * 左右の腕の action(上げ下げ toggle・角度補間)の発火・購読・毎フレーム制御
 *
 * - 左右で共通の toggle ロジック(`useArmToggle`)を `BoxBot-action-arm-left-toggle`/`BoxBot-action-arm-right-toggle`\
 *   それぞれのイベント名で個別に呼び出す
 * - `up`/`down` 状態に応じた目標角度へ `approach` で毎フレーム補間する
 * - マウント時のみ初期角度を ref へ直接反映する。rotation を JSX prop として渡すと\
 *   toggle のたびに再レンダリングで直接上書きされ、`approach` による補間より先に\
 *   目標角度へジャンプしてしまう(瞬間切り替わりの原因)ため、初期表示だけここで済ませ、\
 *   以降は `useFrame` のみで更新する
 *
 * @param props BoxBotModel に渡される props
 * @param cfg マージ後の設定値
 */
export const useArmAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
  cfg: BoxBot3DConfig,
): Pick<UseBoxBotModelReturn, 'arm'> => {
  const { interactive = true } = props

  const eventTarget = useBoxBotEventTarget()
  const left = useArmToggle(interactive, eventTarget, ACTION_ARM_LEFT_TOGGLE)
  const right = useArmToggle(interactive, eventTarget, ACTION_ARM_RIGHT_TOGGLE)

  const { leftArmRef, rightArmRef } = useBoxBotRefs()

  const leftArmAngle = left.up ? ARM_UP_ANGLE : cfg.arm.leftAngle
  const rightArmAngle = right.up ? cfg.arm.rightAngle : ARM_DOWN_ANGLE

  React.useLayoutEffect(() => {
    if (leftArmRef.current) leftArmRef.current.rotation.z = leftArmAngle
    if (rightArmRef.current) rightArmRef.current.rotation.z = rightArmAngle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, dt) => {
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

  return { arm: { left, right } }
}
