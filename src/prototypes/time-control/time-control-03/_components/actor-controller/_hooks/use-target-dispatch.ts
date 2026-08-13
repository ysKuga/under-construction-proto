import { useIntentStore, usePositionStore } from '../../../_stores'
import { ActorControllerProps, UseActorControllerReturn } from '../index.types'

/**
 * actor の target 企図実行 (現在位置からランダムオフセット)
 *
 * @param props ActorController に渡される props
 */
export const useTargetDispatch = (
  props: ActorControllerProps,
): Pick<UseActorControllerReturn, 'dispatchTarget'> => {
  const { id } = props

  const position = usePositionStore((state) => state.getPosition(id))
  const dispatchMoveIntent = useIntentStore((state) => state.dispatchMoveIntent)

  const dispatchTarget = () => {
    dispatchMoveIntent({
      actorId: id,
      target: {
        x: position.x + Math.round(Math.random() * 6 - 3),
        y: position.y + Math.round(Math.random() * 6 - 3),
      },
    })
  }

  return { dispatchTarget }
}
