import { useTimeControl03EventDispatcher } from '../../../_events'
import { UseActionBarReturn } from '../index.types'

/**
 * reset-all イベントを発行する
 */
export const useResetAll = (): Pick<UseActionBarReturn, 'resetAll'> => {
  const dispatch = useTimeControl03EventDispatcher()

  const resetAll = () => {
    dispatch('reset-all')
  }

  return { resetAll }
}
