import {
  useActorSettingsStore,
  useActorStore,
  useGameClockStore,
  usePathStore,
  usePlannedPathStore,
  usePositionStore,
} from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-reset-all イベントを購読し、全 store (状態を持たない intent-store 以外) を初期状態に戻す
 */
export const useResetAllEventListener = () => {
  const resetActorSettings = useActorSettingsStore((state) => state.reset)
  const resetPosition = usePositionStore((state) => state.reset)
  const resetActor = useActorStore((state) => state.reset)
  const resetPath = usePathStore((state) => state.reset)
  const resetPlannedPath = usePlannedPathStore((state) => state.reset)
  const resetGameClock = useGameClockStore((state) => state.reset)

  useTimeControl03EventListener('TimeControl03-reset-all', () => {
    resetActor()
    resetActorSettings()
    resetPath()
    resetPlannedPath()
    resetPosition()
    resetGameClock()
  })
}
