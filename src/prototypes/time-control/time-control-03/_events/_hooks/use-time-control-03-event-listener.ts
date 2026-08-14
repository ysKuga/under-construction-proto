import { useEventListener } from '@/hooks/use-event-listener'

import { useScopeEventTarget } from '../_contexts/scope-event-context'
import { TimeControl03EventMap } from '../index.types'

/**
 * scope (この time-control-03 instance) 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 */
export const useTimeControl03EventListener = <
  K extends keyof TimeControl03EventMap,
>(
  type: K,
  handler: (event: CustomEvent<TimeControl03EventMap[K]>) => void,
) => {
  const eventTarget = useScopeEventTarget()

  useEventListener<CustomEvent<TimeControl03EventMap[K]>>(
    type,
    handler,
    eventTarget,
  )
}
