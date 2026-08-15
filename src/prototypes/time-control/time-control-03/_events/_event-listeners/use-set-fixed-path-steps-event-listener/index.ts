import { useActorSettingsStore } from '../../../_stores'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * set-fixed-path-steps イベントを購読し、対象 actor の固定 step 数を設定する
 */
export const useSetFixedPathStepsEventListener = () => {
  const setFixedPathSteps = useActorSettingsStore(
    (state) => state.setFixedPathSteps,
  )

  useTimeControl03EventListener('set-fixed-path-steps', (event) => {
    const { actorId, steps } = event.detail
    setFixedPathSteps(actorId, steps)
  })
}
