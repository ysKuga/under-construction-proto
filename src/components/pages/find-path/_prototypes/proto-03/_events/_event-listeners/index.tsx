import { useEnergyPathGuardEventListener } from './use-energy-path-guard-event-listener'
import { useItemUseEventListener } from './use-item-use-event-listener'
import { useRecoverEnergyItemEffectEventListener } from './use-recover-energy-item-effect-event-listener'

/**
 * find-path（proto-03）scope 全体のイベント購読をまとめて有効化する
 *
 * - 新しい購読 (`use-xxx-event-listener`) を追加する際は、ここに呼び出しを足すだけでよい
 */
export const FindPathEventListeners = () => {
  useEnergyPathGuardEventListener()
  useItemUseEventListener()
  useRecoverEnergyItemEffectEventListener()

  return null
}
