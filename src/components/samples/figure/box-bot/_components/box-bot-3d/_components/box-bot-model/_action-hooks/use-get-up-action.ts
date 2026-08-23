import { useFrame } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import {
  ACTION_GET_UP,
  FALL_ANGLE,
  FALL_ARM_ANGLE,
  GET_UP_ARM_PUSH_ANGLE,
  GET_UP_DUR,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/** 腕が「床を押す位置」に達するまでの getUp 進行度の割合(以降は通常位置(0)へ) */
const ARM_PUSH_PHASE_RATIO = 0.5

/**
 * 起き上がり(getUp) action の発火・購読・可視化
 *
 * - 転倒(`useFallAction`)とは別 action。倒れている(`postureRef.current === 1`)時のみ発火可能
 * - `startGetUp` は dispatch のみに徹し、実行判定は `useEventListener` 側の `getUpAction` へ一本化する
 * - 回転は fall と同じく `fallPivotRef`(接地点へ pivot 済みのグループ)へ適用する
 * - 腕は fall の位置(頭寄り)から開始し、進行度前半で床を押す位置(`GET_UP_ARM_PUSH_ANGLE`)へ、\
 *   後半で通常位置(0)へとイージングする(2 フェーズの線形補間)
 *
 * @param props BoxBotModel に渡される props
 */
export const useGetUpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'startGetUp'> => {
  const { interactive } = props

  const { fallPivotRef, getUpRef, leftArmRef, postureRef, rightArmRef } =
    useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const getUpAction = () => {
    if (!interactive) return
    if (postureRef.current !== 1) return
    getUpRef.current = 0
  }

  const dispatch = useEventDispatcher(eventTarget)
  useEventListener(ACTION_GET_UP, getUpAction, { target: eventTarget })

  const startGetUp = () => {
    void dispatch(new Event(ACTION_GET_UP))
  }

  // 起き上がり進行度に応じた fallPivotRef の前傾回転(fall の逆方向)・腕の角度
  useFrame((_, dt) => {
    if (!fallPivotRef.current) return
    if (getUpRef.current < 0) return

    getUpRef.current += dt
    if (getUpRef.current >= GET_UP_DUR) {
      getUpRef.current = -1
      postureRef.current = 0
      fallPivotRef.current.rotation.x = 0
      if (leftArmRef.current) leftArmRef.current.rotation.x = 0
      if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      return
    }

    const p = getUpRef.current / GET_UP_DUR
    fallPivotRef.current.rotation.x = FALL_ANGLE * (1 - p * p)

    // 腕: 前半で fall の位置(頭寄り)→ 床を押す位置、後半で通常位置(0)へ
    const armAngle =
      p < ARM_PUSH_PHASE_RATIO
        ? FALL_ARM_ANGLE +
          (GET_UP_ARM_PUSH_ANGLE - FALL_ARM_ANGLE) * (p / ARM_PUSH_PHASE_RATIO)
        : GET_UP_ARM_PUSH_ANGLE *
          (1 - (p - ARM_PUSH_PHASE_RATIO) / (1 - ARM_PUSH_PHASE_RATIO))
    if (leftArmRef.current) leftArmRef.current.rotation.x = armAngle
    if (rightArmRef.current) rightArmRef.current.rotation.x = armAngle
  })

  return { startGetUp }
}
