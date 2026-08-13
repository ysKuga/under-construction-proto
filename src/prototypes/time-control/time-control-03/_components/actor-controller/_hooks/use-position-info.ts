import { usePathStore, usePositionStore } from '../../../_stores'
import { ActorControllerProps, UseActorControllerReturn } from '../index.types'

/**
 * actor の現在位置・残り経路・企図取得
 *
 * @param props ActorController に渡される props
 */
export const usePositionInfo = (
  props: ActorControllerProps,
): Pick<UseActorControllerReturn, 'intentTarget' | 'path' | 'position'> => {
  const { id } = props

  const position = usePositionStore((state) => state.getPosition(id))
  const path = usePathStore((state) => state.getPath(id))
  const intentTarget = path[path.length - 1]

  return { intentTarget, path, position }
}
