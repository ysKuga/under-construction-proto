import { useTimeControl03EventDispatcher } from '../../_events'

import { UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 */
export const useActionBar = (): UseActionBarReturn => {
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchDecision: UseActionBarReturn['dispatchDecision'] =
    timeControl03EventDispatcher['TimeControl03-dispatch-decision']

  const dispatchTargetAll: UseActionBarReturn['dispatchTargetAll'] =
    timeControl03EventDispatcher['TimeControl03-dispatch-target-all']

  const resetAll: UseActionBarReturn['resetAll'] =
    timeControl03EventDispatcher['TimeControl03-reset-all']

  return {
    dispatchDecision,
    dispatchTargetAll,
    resetAll,
  }
}
