import { useTimeControl03EventDispatcher } from '../../../_events'
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

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchTarget: UseActorControllerReturn['dispatchTarget'] = () => {
    timeControl03EventDispatcher['TimeControl03-dispatch-target']({
      actorId: id,
    })
  }

  return { dispatchTarget }
}
