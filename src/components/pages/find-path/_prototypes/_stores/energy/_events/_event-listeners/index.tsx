import { useConsumeEnergyEventListener } from './use-consume-energy-event-listener'
import { useOutOfEnergyEventListener } from './use-out-of-energy-event-listener'
import { useRecoverEnergyEventListener } from './use-recover-energy-event-listener'

/**
 * energy scope 全体のイベント購読をまとめて有効化する
 *
 * - 新しい購読 (`use-xxx-event-listener`) を追加する際は、ここに呼び出しを足すだけでよい
 */
export const EnergyEventListeners = () => {
  useConsumeEnergyEventListener()
  useRecoverEnergyEventListener()
  useOutOfEnergyEventListener()

  return null
}
