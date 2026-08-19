import { useAsyncSampleEventListener } from './use-async-sample-event-listener'
import { useDispatchDecisionEventListener } from './use-dispatch-decision-event-listener'
import { useDispatchTargetEventListener } from './use-dispatch-target-event-listener'
import { useResetAllEventListener } from './use-reset-all-event-listener'
import { useSetFixedPathStepsEventListener } from './use-set-fixed-path-steps-event-listener'
import { useSetIsFixedPathStepsEventListener } from './use-set-is-fixed-path-steps-event-listener'
import { useSetTickMsEventListener } from './use-set-tick-ms-event-listener'
import { useSetTimeScaleEventListener } from './use-set-time-scale-event-listener'
import { useToggleProgressModeEventListener } from './use-toggle-progress-mode-event-listener'

/**
 * scope 全体のイベント購読をまとめて有効化する
 *
 * - 新しい購読 (`use-xxx-event-listener`) を追加する際は、ここに呼び出しを足すだけでよい
 */
export const ScopeEventListeners = () => {
  useAsyncSampleEventListener()
  useDispatchDecisionEventListener()
  useDispatchTargetEventListener()
  useResetAllEventListener()
  useSetFixedPathStepsEventListener()
  useSetIsFixedPathStepsEventListener()
  useSetTickMsEventListener()
  useSetTimeScaleEventListener()
  useToggleProgressModeEventListener()

  return null
}
