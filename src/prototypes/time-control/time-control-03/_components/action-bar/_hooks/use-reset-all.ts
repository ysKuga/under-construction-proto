import { useTimeControl03EventDispatcher } from '../../../_events'
import { UseActionBarReturn } from '../index.types'

/**
 * reset-all イベントを発行する
 */
export const useResetAll = (): Pick<UseActionBarReturn, 'resetAll'> => {
  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const resetAll = () => {
    timeControl03EventDispatcher['reset-all']()
  }

  return { resetAll }
}
