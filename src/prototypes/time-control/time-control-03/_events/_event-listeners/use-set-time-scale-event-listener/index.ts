import { useGameClockStore } from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-set-time-scale イベントを購読し、進行倍率を設定する
 */
export const useSetTimeScaleEventListener = () => {
  const setTimeScale = useGameClockStore((state) => state.setTimeScale)

  useTimeControl03EventListener('TimeControl03-set-time-scale', (event) => {
    const { timeScale } = event.detail
    setTimeScale(timeScale)
  })
}
