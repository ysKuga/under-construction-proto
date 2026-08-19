import { useActorSettingsStore } from '../../../_stores'
import { useTimeControl03Props } from '../../../index.contexts'
import { useTimeControl03EventListener } from '../../_hooks/use-time-control-03-event-listener'

/**
 * TimeControl03-set-is-fixed-path-steps-all イベントを購読し、対象 actor 一括の固定 step 有効/無効を設定する
 */
export const useSetIsFixedPathStepsAllEventListener = () => {
  const { actorIds } = useTimeControl03Props()
  const setIsFixedPathStepsAll = useActorSettingsStore(
    (state) => state.setIsFixedPathStepsAll,
  )

  useTimeControl03EventListener(
    'TimeControl03-set-is-fixed-path-steps-all',
    (event) => {
      const { checked } = event.detail
      setIsFixedPathStepsAll(actorIds, checked)
    },
  )
}
