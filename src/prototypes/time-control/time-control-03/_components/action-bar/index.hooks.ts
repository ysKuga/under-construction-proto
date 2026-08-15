import { useTimeControl03EventDispatcher } from '../../_events'

import { useProgressMode } from './_hooks/use-progress-mode'
import { UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 */
export const useActionBar = (): UseActionBarReturn => {
  const { progressMode } = useProgressMode()
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchDecision: UseActionBarReturn['dispatchDecision'] =
    timeControl03EventDispatcher['dispatch-decision']

  const resetAll: UseActionBarReturn['resetAll'] =
    timeControl03EventDispatcher['reset-all']

  const toggleProgressMode: UseActionBarReturn['toggleProgressMode'] =
    timeControl03EventDispatcher['toggle-progress-mode']

  return {
    dispatchDecision,
    progressMode,
    resetAll,
    toggleProgressMode,
  }
}
