import { usePositionStore } from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * dispatch-decision イベントを購読し、対象 actor 一括の行動決定を実行する
 */
export const useDispatchDecisionEventListener = () => {
  const dispatchActions = usePositionStore((state) => state.dispatchActions)

  useTimeControl03EventListener('dispatch-decision', (event) => {
    dispatchActions(event.detail.actorIds)
  })
}
