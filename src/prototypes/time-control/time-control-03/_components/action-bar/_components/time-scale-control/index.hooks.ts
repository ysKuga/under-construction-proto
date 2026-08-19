import { useTimeControl03EventDispatcher } from '../../../../_events'
import { useGameClockStore } from '../../../../_stores'

import { UseTimeScaleControlReturn } from './index.types'

/**
 * TimeScaleControl の操作ロジック
 */
export const useTimeScaleControl = (): UseTimeScaleControlReturn => {
  const timeScale = useGameClockStore((state) => state.timeScale)

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  const setTimeScale: UseTimeScaleControlReturn['setTimeScale'] = (
    nextTimeScale,
  ) => {
    timeControl03EventDispatcher['TimeControl03-set-time-scale']({
      timeScale: nextTimeScale,
    })
  }

  return { setTimeScale, timeScale }
}
