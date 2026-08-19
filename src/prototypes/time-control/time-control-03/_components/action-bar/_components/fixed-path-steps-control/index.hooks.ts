import { useTimeControl03EventDispatcher } from '../../../../_events'
import { useActorSettingsStore } from '../../../../_stores'
import { useTimeControl03Props } from '../../../../index.contexts'

import { UseFixedPathStepsControlReturn } from './index.types'

/**
 * FixedPathStepsControl の操作ロジック
 */
export const useFixedPathStepsControl = (): UseFixedPathStepsControlReturn => {
  const { actorIds } = useTimeControl03Props()

  const fixedPathSteps = useActorSettingsStore(
    (state) => state.getActorSettings(actorIds[0]).fixedPathSteps,
  )
  const isFixedPathSteps = useActorSettingsStore(
    (state) => state.getActorSettings(actorIds[0]).isFixedPathSteps,
  )

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const setFixedPathStepsAll: UseFixedPathStepsControlReturn['setFixedPathStepsAll'] =
    (steps) => {
      timeControl03EventDispatcher['TimeControl03-set-fixed-path-steps-all']({
        steps,
      })
    }

  const setIsFixedPathStepsAll: UseFixedPathStepsControlReturn['setIsFixedPathStepsAll'] =
    (isFixed) => {
      timeControl03EventDispatcher['TimeControl03-set-is-fixed-path-steps-all'](
        { checked: isFixed },
      )
    }

  return {
    fixedPathSteps,
    isFixedPathSteps,
    setFixedPathStepsAll,
    setIsFixedPathStepsAll,
  }
}
