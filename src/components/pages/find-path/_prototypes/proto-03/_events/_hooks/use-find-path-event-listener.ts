import { useEventListener } from '@/hooks/event'

import { useFindPathEventTarget } from '../_contexts/event-context'
import { FindPathEventMap } from '../index.types'

/**
 * find-path 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 多重登録許可の指定
 */
export const useFindPathEventListener = <K extends keyof FindPathEventMap>(
  type: K,
  handler: (event: CustomEvent<FindPathEventMap[K]>) => Promise<void> | void,
  options: { allowMultiple?: boolean } = {},
) => {
  const eventTarget = useFindPathEventTarget()

  useEventListener<CustomEvent<FindPathEventMap[K]>>(type, handler, {
    allowMultiple: options.allowMultiple,
    target: eventTarget,
  })
}
