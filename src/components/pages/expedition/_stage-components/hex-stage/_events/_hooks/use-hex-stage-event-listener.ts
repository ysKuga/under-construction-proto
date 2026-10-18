import { useEventListener } from '@/hooks/event'

import { useHexStageEventTarget } from '../_contexts/event-context'
import { HexStageEventMap } from '../index.types'

/**
 * hex-stage 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 多重登録許可の指定
 */
export const useHexStageEventListener = <K extends keyof HexStageEventMap>(
  type: K,
  handler: (event: CustomEvent<HexStageEventMap[K]>) => Promise<void> | void,
  options: { allowMultiple?: boolean } = {},
) => {
  const eventTarget = useHexStageEventTarget()

  useEventListener<CustomEvent<HexStageEventMap[K]>>(type, handler, {
    allowMultiple: options.allowMultiple,
    target: eventTarget,
  })
}
