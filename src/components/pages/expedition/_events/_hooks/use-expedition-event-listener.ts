import { useEventListener } from '@/hooks/event'

import { useExpeditionEventTarget } from '../_contexts/event-context'
import { ExpeditionEventMap } from '../index.types'

/**
 * expedition 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 多重登録許可の指定
 */
export const useExpeditionEventListener = <K extends keyof ExpeditionEventMap>(
  type: K,
  handler: (event: CustomEvent<ExpeditionEventMap[K]>) => Promise<void> | void,
  options: { allowMultiple?: boolean } = {},
) => {
  const eventTarget = useExpeditionEventTarget()

  useEventListener<CustomEvent<ExpeditionEventMap[K]>>(type, handler, {
    allowMultiple: options.allowMultiple,
    target: eventTarget,
  })
}
