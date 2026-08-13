import {
  useActorSettingsStore,
  useActorStore,
  useGameClockStore,
  usePathStore,
  usePlannedPathStore,
  usePositionStore,
} from '../../../_stores'
import { UseActionBarReturn } from '../index.types'

/**
 * 全 store (状態を持たない intent-store 以外) を初期状態に戻す
 */
export const useResetAll = (): Pick<UseActionBarReturn, 'resetAll'> => {
  const resetActorSettings = useActorSettingsStore((state) => state.reset)
  const resetPosition = usePositionStore((state) => state.reset)
  const resetActor = useActorStore((state) => state.reset)
  const resetPath = usePathStore((state) => state.reset)
  const resetPlannedPath = usePlannedPathStore((state) => state.reset)
  const resetGameClock = useGameClockStore((state) => state.reset)

  const resetAll = () => {
    resetActor()
    resetActorSettings()
    resetPath()
    resetPlannedPath()
    resetPosition()
    resetGameClock()
  }

  return { resetAll }
}
