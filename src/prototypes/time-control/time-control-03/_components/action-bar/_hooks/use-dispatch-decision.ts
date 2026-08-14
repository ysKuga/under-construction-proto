import { useTimeControl03EventDispatcher } from '../../../_events'
import { ActionBarProps, UseActionBarReturn } from '../index.types'

/**
 * 対象 actor 一括の行動決定実行
 *
 * @param props ActionBar に渡される props
 */
export const useDispatchDecision = (
  props: ActionBarProps,
): Pick<UseActionBarReturn, 'dispatchDecision'> => {
  const { actorIds } = props

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const dispatchDecision = () => {
    timeControl03EventDispatcher['dispatch-decision']({ actorIds })
  }

  return { dispatchDecision }
}
