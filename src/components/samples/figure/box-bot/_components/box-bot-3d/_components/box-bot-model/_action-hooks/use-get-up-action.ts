import { useFrame } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import {
  ACTION_GET_UP,
  ARM_RETURN_DUR,
  FALL_ANGLE,
  FALL_ARM_ANGLE,
  GET_UP_DUR,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * 起き上がり(getUp) action の発火・購読・可視化
 *
 * - 転倒(`useFallAction`)とは別 action。倒れている(`postureRef.current === 1`)時のみ発火可能
 * - `startGetUp` は dispatch のみに徹し、実行判定は `useEventListener` 側の `getUpAction` へ一本化する
 * - 回転は fall と同じく `fallPivotRef`(接地点へ pivot 済みのグループ)へ適用する
 * - 腕は体が垂直に戻るまで fall の位置(頭寄り、`FALL_ARM_ANGLE`)のまま維持し、体が直立してから\
 *   `armReturnRef` で定位置(0)へ戻す。2 段階の順序立てた動きにするため、体の回転(`getUpRef`)と\
 *   腕の戻り(`armReturnRef`)を別 ref で管理する
 *
 * @param props BoxBotModel に渡される props
 */
export const useGetUpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'startGetUp'> => {
  const { interactive } = props

  const {
    armReturnRef,
    fallPivotRef,
    getUpRef,
    leftArmRef,
    postureRef,
    rightArmRef,
  } = useBoxBotRefs()
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

  useFrame((_, dt) => {
    // 体の回転フェーズ。完了までは腕を fall の位置(頭寄り)のまま維持する
    if (fallPivotRef.current && getUpRef.current >= 0) {
      getUpRef.current += dt
      if (getUpRef.current >= GET_UP_DUR) {
        getUpRef.current = -1
        postureRef.current = 0
        fallPivotRef.current.rotation.x = 0
        armReturnRef.current = 0
      } else {
        const p = getUpRef.current / GET_UP_DUR
        fallPivotRef.current.rotation.x = FALL_ANGLE * (1 - p * p)
      }
    }

    // 体が直立した後、腕を定位置(0)へ戻すフェーズ
    if (armReturnRef.current >= 0) {
      armReturnRef.current += dt
      if (armReturnRef.current >= ARM_RETURN_DUR) {
        armReturnRef.current = -1
        if (leftArmRef.current) leftArmRef.current.rotation.x = 0
        if (rightArmRef.current) rightArmRef.current.rotation.x = 0
      } else {
        const p = armReturnRef.current / ARM_RETURN_DUR
        const armAngle = FALL_ARM_ANGLE * (1 - p * p)
        if (leftArmRef.current) leftArmRef.current.rotation.x = armAngle
        if (rightArmRef.current) rightArmRef.current.rotation.x = armAngle
      }
    }
  })

  return { startGetUp }
}
