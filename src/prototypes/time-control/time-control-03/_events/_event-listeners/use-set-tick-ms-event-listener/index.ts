import { useActorStore } from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-set-tick-ms イベントを購読し、対象 actor の tick 時間を設定する
 */
export const useSetTickMsEventListener = () => {
  const setTickMs = useActorStore((state) => state.setTickMs)

  useTimeControl03EventListener('TimeControl03-set-tick-ms', (event) => {
    const { actorId, tickMs } = event.detail
    setTickMs(actorId, tickMs)
  })
}
