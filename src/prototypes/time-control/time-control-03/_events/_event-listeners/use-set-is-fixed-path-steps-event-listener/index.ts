import { useActorSettingsStore } from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * set-is-fixed-path-steps イベントを購読し、対象 actor の固定 step 有効を切替える
 */
export const useSetIsFixedPathStepsEventListener = () => {
  const setIsFixedPathSteps = useActorSettingsStore(
    (state) => state.setIsFixedPathSteps,
  )

  useTimeControl03EventListener('set-is-fixed-path-steps', (event) => {
    const { actorId, checked } = event.detail
    setIsFixedPathSteps(actorId, checked)
  })
}
