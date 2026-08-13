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
  const setFixedPathStepsStore = useActorSettingsStore(
    (state) => state.setFixedPathSteps,
  )
  const setIsFixedPathStepsStore = useActorSettingsStore(
    (state) => state.setIsFixedPathSteps,
  )

  const setFixedPathSteps = (steps: number) => {
    setFixedPathStepsStore(id, steps)
  }

  const setIsFixedPathSteps = (checked: boolean) => {
    setIsFixedPathStepsStore(id, checked)
  }

  return {
    fixedPathSteps,
    isFixedPathSteps,
    setFixedPathSteps,
    setIsFixedPathSteps,
  }
}
