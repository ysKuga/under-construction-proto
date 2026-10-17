import { useEventListener } from '@/hooks/event'

import { useEnergyEventTarget } from '../_contexts/event-context'
import { EnergyEventMap } from '../index.types'

/**
 * energy 専用 EventTarget 上のイベントを購読する
 *
 * @param type イベント名
 * @param handler イベント発火時に呼ぶ処理
 * @param options 多重登録許可の指定
 */
export const useEnergyEventListener = <K extends keyof EnergyEventMap>(
  type: K,
  handler: (event: CustomEvent<EnergyEventMap[K]>) => Promise<void> | void,
  options: { allowMultiple?: boolean } = {},
) => {
  const eventTarget = useEnergyEventTarget()

  useEventListener<CustomEvent<EnergyEventMap[K]>>(type, handler, {
    allowMultiple: options.allowMultiple,
    target: eventTarget,
  })
}
