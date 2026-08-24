import * as React from 'react'

import { useEventListener } from '@/hooks/event'

import type { ArmSideState } from '../../../index.types'

/**
 * 片腕(左右いずれか)の上げ下げ toggle の購読
 *
 * - `eventType` の受信(state 切替)を `useEventListener` で行う。クリック起点\
 *   (`clickArmLeft`/`clickArmRight`、`useClickActions`)・外部起点\
 *   (`useBoxBotActionDispatcher`)いずれも同じイベントを dispatch するため、実行判定が一本化される
 * - `interactive` による制御も実行側で行う
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

  useEventListener(eventType, toggleAction, { target: eventTarget })

  return { up }
}
