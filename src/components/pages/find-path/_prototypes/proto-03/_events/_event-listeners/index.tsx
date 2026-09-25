import { useEnergyPathGuardEventListener } from './use-energy-path-guard-event-listener'

/**
 * find-path（proto-03）scope 全体のイベント購読をまとめて有効化する
 *
 * - 新しい購読 (`use-xxx-event-listener`) を追加する際は、ここに呼び出しを足すだけでよい
 */
export const FindPathEventListeners = () => {
  useEnergyPathGuardEventListener()

  return null
}
