import { usePositionStore } from '../../../_stores'
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

  const dispatchActions = usePositionStore((state) => state.dispatchActions)

  const dispatchDecision = () => {
    dispatchActions(actorIds)
  }

  return { dispatchDecision }
}
