import { useAsyncSampleEventListener } from './use-async-sample-event-listener'
import { useDispatchDecisionEventListener } from './use-dispatch-decision-event-listener'
import { useDispatchTargetAllEventListener } from './use-dispatch-target-all-event-listener'
import { useDispatchTargetEventListener } from './use-dispatch-target-event-listener'
import { useResetAllEventListener } from './use-reset-all-event-listener'
import { useSetFixedPathStepsAllEventListener } from './use-set-fixed-path-steps-all-event-listener'
import { useSetFixedPathStepsEventListener } from './use-set-fixed-path-steps-event-listener'
import { useSetIsFixedPathStepsAllEventListener } from './use-set-is-fixed-path-steps-all-event-listener'
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
  useDispatchTargetAllEventListener()
  useDispatchTargetEventListener()
  useResetAllEventListener()
  useSetFixedPathStepsAllEventListener()
  useSetFixedPathStepsEventListener()
  useSetIsFixedPathStepsAllEventListener()
  useSetIsFixedPathStepsEventListener()
  useSetTickMsEventListener()
  useSetTimeScaleEventListener()
  useToggleProgressModeEventListener()

  return null
}
