import { useFrame } from '@react-three/fiber'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { ACTION_GET_UP, FALL_ANGLE, GET_UP_DUR } from '../index.constants'
import { useBoxBotEventTarget, useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * 起き上がり(getUp) action の発火・購読・可視化
 *
 * - 転倒(`useFallAction`)とは別 action。倒れている(`postureRef.current === 1`)時のみ発火可能
 * - `startGetUp` は dispatch のみに徹し、実行判定は `useEventListener` 側の `getUpAction` へ一本化する
 *
 * @param props BoxBotModel に渡される props
 */
export const useGetUpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'startGetUp'> => {
  const { interactive } = props

  const { getUpRef, postureRef, rootRef } = useBoxBotRefs()
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

  // 起き上がり進行度に応じた rootRef の前傾回転(fall の逆方向)
  useFrame((_, dt) => {
    if (!rootRef.current) return
    if (getUpRef.current < 0) return

    getUpRef.current += dt
    if (getUpRef.current >= GET_UP_DUR) {
      getUpRef.current = -1
      postureRef.current = 0
      rootRef.current.rotation.x = 0
      return
    }

    const p = getUpRef.current / GET_UP_DUR
    rootRef.current.rotation.x = FALL_ANGLE * (1 - p * p)
  })

  return { startGetUp }
}
