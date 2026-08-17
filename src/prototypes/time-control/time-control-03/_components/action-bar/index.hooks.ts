import { useTimeControl03Computed } from '../../_computed'
import { useTimeControl03EventDispatcher } from '../../_events'

import { UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 */
export const useActionBar = (): UseActionBarReturn => {
  const progressMode = useTimeControl03Computed((state) => state.progressMode)

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchDecision: UseActionBarReturn['dispatchDecision'] =
    timeControl03EventDispatcher['TimeControl03-dispatch-decision']

  const resetAll: UseActionBarReturn['resetAll'] =
    timeControl03EventDispatcher['TimeControl03-reset-all']

  const toggleProgressMode: UseActionBarReturn['toggleProgressMode'] =
    timeControl03EventDispatcher['TimeControl03-toggle-progress-mode']

  return {
    dispatchDecision,
    progressMode,
    resetAll,
    toggleProgressMode,
  }
}
