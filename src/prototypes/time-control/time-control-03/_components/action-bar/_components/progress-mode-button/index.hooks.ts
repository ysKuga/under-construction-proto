import { useTimeControl03Computed } from '../../../../_computed'
import { useTimeControl03EventDispatcher } from '../../../../_events'

import { UseProgressModeButtonReturn } from './index.types'

/**
 * ProgressModeButton の操作ロジック
 */
export const useProgressModeButton = (): UseProgressModeButtonReturn => {
  const progressMode = useTimeControl03Computed((state) => state.progressMode)

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const toggleProgressMode: UseProgressModeButtonReturn['toggleProgressMode'] =
    timeControl03EventDispatcher['TimeControl03-toggle-progress-mode']

  return { progressMode, toggleProgressMode }
}
