import { useIntentStore, usePositionStore } from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * dispatch-target イベントを購読し、対象 actor の target 企図を実行する(現在位置からランダムオフセット)
 */
export const useDispatchTargetEventListener = () => {
  const getPosition = usePositionStore((state) => state.getPosition)
  const dispatchMoveIntent = useIntentStore((state) => state.dispatchMoveIntent)

  useTimeControl03EventListener('dispatch-target', (event) => {
    const { actorId } = event.detail
    const position = getPosition(actorId)

    dispatchMoveIntent({
      actorId,
      target: {
        x: position.x + Math.round(Math.random() * 6 - 3),
        y: position.y + Math.round(Math.random() * 6 - 3),
      },
    })
  })
}
