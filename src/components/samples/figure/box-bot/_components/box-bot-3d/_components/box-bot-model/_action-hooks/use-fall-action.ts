import { useFrame } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import {
  ACTION_FALL,
  FALL_ANGLE,
  FALL_ARM_ANGLE,
  FALL_DUR,
} from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * 転倒(fall) action の発火・購読・可視化
 *
 * - 起き上がり(`useGetUpAction`)とは別 action。転倒後は `postureRef = 1` で静止し、\
 *   起き上がりは別トリガーで明示的に発火する
 * - 直立(`postureRef.current === 0`)の時のみ発火可能。歩行(`walking`/`marching`)中の\
 *   転倒も想定するため、発火時に `walkingRef`/`marchingRef` を止める
 * - jump と同じく `startFall` は dispatch のみに徹し、実行判定(`interactive`・姿勢チェック)は\
 *   `useEventListener` 側の `fallAction` へ一本化する
 * - 回転は `rootRef` でなく `fallPivotRef`(接地点へ pivot 済みのグループ)へ適用する。\
 *   体の中心を軸に回すと接地点が浮いてしまうため
 * - 発火時に腕を前へ出す(`rotation.x` を即座に切替える toggle 実装)。将来 この動きを\
 *   独立 action(軌道)として分離する可能性がある
 *
 * @param props BoxBotModel に渡される props
 */
export const useFallAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'startFall'> => {
  const { interactive } = props

  const {
    fallPivotRef,
    fallRef,
    leftArmRef,
    marchingRef,
    postureRef,
    rightArmRef,
    walkingRef,
  } = useBoxBotRefs()
  const eventTarget = useBoxBotEventTarget()

  const fallAction = () => {
    if (!interactive) return
    if (postureRef.current !== 0) return
    walkingRef.current = false
    marchingRef.current = false
    if (leftArmRef.current) leftArmRef.current.rotation.x = FALL_ARM_ANGLE
    if (rightArmRef.current) rightArmRef.current.rotation.x = FALL_ARM_ANGLE
    fallRef.current = 0
  }

  const dispatch = useEventDispatcher(eventTarget)
  useEventListener(ACTION_FALL, fallAction, { target: eventTarget })

  const startFall = () => {
    void dispatch(new Event(ACTION_FALL))
  }

  // 転倒進行度に応じた fallPivotRef の前傾回転
  useFrame((_, dt) => {
    if (!fallPivotRef.current) return
    if (fallRef.current < 0) return

    fallRef.current += dt
    if (fallRef.current >= FALL_DUR) {
      fallRef.current = -1
      postureRef.current = 1
      fallPivotRef.current.rotation.x = FALL_ANGLE
      return
    }

    const p = fallRef.current / FALL_DUR
    fallPivotRef.current.rotation.x = FALL_ANGLE * (p * (2 - p))
  })

  return { startFall }
}
