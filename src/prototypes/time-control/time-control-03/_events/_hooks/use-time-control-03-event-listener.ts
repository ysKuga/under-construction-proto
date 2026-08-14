import { useEventListener } from '@/hooks/event'

import { useScopeEventTarget } from '../_contexts/scope-event-context'
import { TimeControl03EventMap } from '../index.types'

/**
 * scope (この time-control-03 instance) 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 多重登録許可の指定
 */
export const useTimeControl03EventListener = <
  K extends keyof TimeControl03EventMap,
>(
  type: K,
  handler: (
    event: CustomEvent<TimeControl03EventMap[K]>,
  ) => Promise<void> | void,
  options: { allowMultiple?: boolean } = {},
) => {
  const eventTarget = useScopeEventTarget()

  useEventListener<CustomEvent<TimeControl03EventMap[K]>>(type, handler, {
    allowMultiple: options.allowMultiple,
    target: eventTarget,
  })
}
