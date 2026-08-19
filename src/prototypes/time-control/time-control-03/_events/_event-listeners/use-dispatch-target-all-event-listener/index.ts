import { useIntentStore, usePositionStore } from '../../../_stores'
import { useTimeControl03Props } from '../../../index.contexts'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-dispatch-target-all イベントを購読し、対象 actor 一括の target 企図を実行する(現在位置からランダムオフセット)
 */
export const useDispatchTargetAllEventListener = () => {
  const { actorIds } = useTimeControl03Props()
  const getPosition = usePositionStore((state) => state.getPosition)
  const dispatchMoveIntent = useIntentStore((state) => state.dispatchMoveIntent)

  useTimeControl03EventListener('TimeControl03-dispatch-target-all', () => {
    actorIds.forEach((actorId) => {
      const position = getPosition(actorId)

      dispatchMoveIntent({
        actorId,
        target: {
          x: position.x + Math.round(Math.random() * 6 - 3),
          y: position.y + Math.round(Math.random() * 6 - 3),
        },
      })
    })
  })
}
