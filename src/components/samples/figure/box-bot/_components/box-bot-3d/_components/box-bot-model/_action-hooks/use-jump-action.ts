import type { ThreeEvent } from '@react-three/fiber'
import * as React from 'react'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import { JUMP_EVENT_TYPE } from '../index.constants'
import { useBoxBotEventTarget } from '../index.contexts'
import type { BoxBotModelProps, UseBoxBotModelReturn } from '../index.types'

/**
 * ジャンプ action の発火・購読
 *
 * - クリック(`startHop`)は `BoxBot-jump` イベントを dispatch するだけに徹し、\
 *   実際の実行(`hopRef` の起動)は `useEventListener` 側で行う。外部からの\
 *   `useEventListener` 経由の発火も同じ経路を通るため、実行判定が一本化される
 * - `interactive` による制御も実行側(`jumpAction`)で行う。`onClick` 自体は\
 *   常に登録し、`stopPropagation`(クリック伝播の抑止)は interactive に関わらず必要なため
 *
 * @param props BoxBotModel に渡される props
 */
export const useJumpAction = (
  props: Omit<BoxBotModelProps, 'eventTarget'>,
): Pick<UseBoxBotModelReturn, 'hopRef' | 'startHop'> => {
  const { interactive } = props

  const hopRef = React.useRef(-1)
  const eventTarget = useBoxBotEventTarget()

  const jumpAction = () => {
    if (!interactive) return
    if (hopRef.current < 0) hopRef.current = 0
  }

  const dispatch = useEventDispatcher(eventTarget)
  useEventListener(JUMP_EVENT_TYPE, jumpAction, { target: eventTarget })

  const startHop = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(new Event(JUMP_EVENT_TYPE))
  }

  return { hopRef, startHop }
}
