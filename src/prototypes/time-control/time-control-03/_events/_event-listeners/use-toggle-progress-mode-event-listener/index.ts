import { useActorSettingsStore } from '../../../_stores'
import { useTimeControl03Props } from '../../../index.contexts'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-toggle-progress-mode イベントを購読し、対象 actor 一括の進行モードを切替える
 */
export const useToggleProgressModeEventListener = () => {
  const { actorIds } = useTimeControl03Props()
  const toggleProgressMode = useActorSettingsStore(
    (state) => state.toggleProgressMode,
  )

  useTimeControl03EventListener('TimeControl03-toggle-progress-mode', () => {
    toggleProgressMode(actorIds)
  })
}
