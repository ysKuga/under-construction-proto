import { useAsyncSampleEventListener } from './use-async-sample-event-listener'
import { useDispatchDecisionEventListener } from './use-dispatch-decision-event-listener'
import { useResetAllEventListener } from './use-reset-all-event-listener'

/**
 * scope 全体のイベント購読をまとめて有効化する
 *
 * - 新しい購読 (`use-xxx-event-listener`) を追加する際は、ここに呼び出しを足すだけでよい
 */
export const ScopeEventListeners = () => {
  useAsyncSampleEventListener()
  useDispatchDecisionEventListener()
  useResetAllEventListener()

  return null
}
