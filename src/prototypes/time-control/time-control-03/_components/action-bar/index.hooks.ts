import { useTimeControl03EventDispatcher } from '../../_events'

import { useDispatchDecision } from './_hooks/use-dispatch-decision'
import { useProgressMode } from './_hooks/use-progress-mode'
import { ActionBarProps, UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 *
 * @param props ActionBar に渡される props
 */
export const useActionBar = (props: ActionBarProps): UseActionBarReturn => {
  const { progressMode, toggleProgressMode } = useProgressMode(props)
  const { dispatchDecision } = useDispatchDecision(props)
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const resetAll = () => {
    timeControl03EventDispatcher['reset-all']()
  }

  return { dispatchDecision, progressMode, resetAll, toggleProgressMode }
}
