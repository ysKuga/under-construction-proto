import { useEventListener } from '@/hooks/event'

import { useStage07EventTarget } from '../_contexts/event-context'
import { Stage07EventMap } from '../index.types'

/**
 * stage-07 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 多重登録許可の指定
 */
export const useStage07EventListener = <K extends keyof Stage07EventMap>(
  type: K,
  handler: (event: CustomEvent<Stage07EventMap[K]>) => Promise<void> | void,
  options: { allowMultiple?: boolean } = {},
) => {
  const eventTarget = useStage07EventTarget()

  useEventListener<CustomEvent<Stage07EventMap[K]>>(type, handler, {
    allowMultiple: options.allowMultiple,
    target: eventTarget,
  })
}
