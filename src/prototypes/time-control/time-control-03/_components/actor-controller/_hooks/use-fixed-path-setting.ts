import { useTimeControl03EventDispatcher } from '../../../_events'
import { useActorSettingsStore } from '../../../_stores'
import { ActorControllerProps, UseActorControllerReturn } from '../index.types'

/**
 * actor の固定 step 数取得・設定
 *
 * @param props ActorController に渡される props
 */
export const useFixedPathSetting = (
  props: ActorControllerProps,
): Pick<
  UseActorControllerReturn,
  | 'fixedPathSteps'
  | 'isFixedPathSteps'
  | 'setFixedPathSteps'
  | 'setIsFixedPathSteps'
> => {
  const { id } = props

  const fixedPathSteps = useActorSettingsStore(
    (state) => state.getActorSettings(id).fixedPathSteps,
  )
  const isFixedPathSteps = useActorSettingsStore(
    (state) => state.getActorSettings(id).isFixedPathSteps,
  )
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const setFixedPathSteps: UseActorControllerReturn['setFixedPathSteps'] = (
    steps,
  ) => {
    timeControl03EventDispatcher['set-fixed-path-steps']({ actorId: id, steps })
  }

  const setIsFixedPathSteps: UseActorControllerReturn['setIsFixedPathSteps'] = (
    checked,
  ) => {
    timeControl03EventDispatcher['set-is-fixed-path-steps']({
      actorId: id,
      checked,
    })
  }

  return {
    fixedPathSteps,
    isFixedPathSteps,
    setFixedPathSteps,
    setIsFixedPathSteps,
  }
}
