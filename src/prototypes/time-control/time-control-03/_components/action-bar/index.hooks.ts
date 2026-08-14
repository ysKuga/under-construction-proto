import { useTimeControl03EventDispatcher } from '../../_events'

import { useProgressMode } from './_hooks/use-progress-mode'
import { ActionBarProps, UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 *
 * @param props ActionBar に渡される props
 */
export const useActionBar = (props: ActionBarProps): UseActionBarReturn => {
  const { actorIds } = props

  const { progressMode, toggleProgressMode } = useProgressMode(props)
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchDecision = () => {
    timeControl03EventDispatcher['dispatch-decision']({ actorIds })
  }

  const resetAll = () => {
    timeControl03EventDispatcher['reset-all']()
  }

  return { dispatchDecision, progressMode, resetAll, toggleProgressMode }
}
