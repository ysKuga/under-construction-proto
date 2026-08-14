import { useEventPending } from '@/hooks/event'

import { useScopeEventTarget } from '../_contexts/scope-event-context'
import { TimeControl03EventMap } from '../index.types'

/**
 * scope (この time-control-03 instance) 専用 EventTarget 上の type が現在 pending かどうかを観測する
 *
 * @param type イベント名
 */
export const useTimeControl03EventPending = <
  K extends keyof TimeControl03EventMap,
>(
  type: K,
) => useEventPending(type, { target: useScopeEventTarget() })
