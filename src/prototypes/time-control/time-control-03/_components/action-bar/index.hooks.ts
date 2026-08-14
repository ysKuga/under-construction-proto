import { useTimeControl03EventDispatcher } from '../../_events'
import { useTimeControl03Props } from '../../index.contexts'

import { useProgressMode } from './_hooks/use-progress-mode'
import { UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 */
export const useActionBar = (): UseActionBarReturn => {
  const { actorIds } = useTimeControl03Props()

  const { progressMode, toggleProgressMode } = useProgressMode()
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchDecision = () => {
    timeControl03EventDispatcher['dispatch-decision']({ actorIds })
  }

  const resetAll: UseActionBarReturn['resetAll'] =
    timeControl03EventDispatcher['reset-all']

  return {
    dispatchDecision,
    progressMode,
    resetAll,
    toggleProgressMode,
  }
}
