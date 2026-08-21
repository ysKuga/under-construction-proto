import type { ThreeEvent } from '@react-three/fiber'
import * as React from 'react'

import { useEventDispatcher, useEventListener } from '@/hooks/event'

import type { ArmSideState } from '../../../index.types'

/**
 * 片腕(左右いずれか)の上げ下げ toggle の発火・購読
 *
 * - クリック側は事象イベントを dispatch するだけに徹し、実際の実行(state 切替)は\
 *   `useEventListener` 側で行う。外部からの `useEventListener` 経由の発火も同じ経路を通る
 * - `interactive` による制御も実行側で行う。クリックハンドラ自体は常に登録し、\
 *   `stopPropagation`(クリック伝播の抑止)は interactive に関わらず必要なため
 */
export const useArmToggle = (
  interactive: boolean,
  eventTarget: EventTarget,
  eventType: string,
): ArmSideState => {
  const [up, setUp] = React.useState(false)

  const toggleAction = () => {
    if (!interactive) return
    setUp((v) => !v)
  }

  const dispatch = useEventDispatcher(eventTarget)
  useEventListener(eventType, toggleAction, { target: eventTarget })

  const toggle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    void dispatch(new Event(eventType))
  }

  return { toggle, up }
}
