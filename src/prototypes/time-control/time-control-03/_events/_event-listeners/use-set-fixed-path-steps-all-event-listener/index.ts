import { useActorSettingsStore } from '../../../_stores'
import { useTimeControl03Props } from '../../../index.contexts'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-set-fixed-path-steps-all イベントを購読し、対象 actor 一括の固定 step 数を設定する
 */
export const useSetFixedPathStepsAllEventListener = () => {
  const { actorIds } = useTimeControl03Props()
  const setFixedPathStepsAll = useActorSettingsStore(
    (state) => state.setFixedPathStepsAll,
  )

  useTimeControl03EventListener(
    'TimeControl03-set-fixed-path-steps-all',
    (event) => {
      const { steps } = event.detail
      setFixedPathStepsAll(actorIds, steps)
    },
  )
}
