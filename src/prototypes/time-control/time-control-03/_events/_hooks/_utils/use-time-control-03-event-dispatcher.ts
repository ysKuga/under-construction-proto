import { useEventDispatcher } from '@/hooks/use-event-dispatcher'

import { useScopeEventTarget } from '../../_contexts/scope-event-context'
import { TimeControl03EventMap } from '../../index.types'

/**
 * scope (この time-control-03 instance) 専用 EventTarget へイベントを発行する dispatcher を返す
 */
export const useTimeControl03EventDispatcher = () => {
  const eventTarget = useScopeEventTarget()
  const dispatch = useEventDispatcher(eventTarget)

  return <K extends keyof TimeControl03EventMap>(
    type: K,
    detail?: TimeControl03EventMap[K],
  ) => dispatch(new CustomEvent(type, { detail }))
}
