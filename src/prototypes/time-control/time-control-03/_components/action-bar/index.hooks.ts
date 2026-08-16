import { useTimeControl03EventDispatcher } from '../../_events'
import { useActorSettingsStore } from '../../_stores'
import { useTimeControl03Props } from '../../index.contexts'

import { UseActionBarReturn } from './index.types'

/**
 * ActionBar の操作ロジック
 */
export const useActionBar = (): UseActionBarReturn => {
  const { actorIds } = useTimeControl03Props()

  // 全 actor 常に同一 mode 前提の代表値取得。
  // actor 毎 個別 mode 持たせる要件が復活したら要見直し(store 側の toggleProgressMode 一括更新も同様)
  // * あるいは progressMode を統一してそれを保持する store を新設
  const progressMode = useActorSettingsStore(
    (state) => state.getActorSettings(actorIds[0]).progressMode,
  )

  const timeControl03EventDispatcher = useTimeControl03EventDispatcher()

  // timeControl03EventListener\('TimeControl03-dispatch-decision'
  const dispatchDecision: UseActionBarReturn['dispatchDecision'] =
    timeControl03EventDispatcher['TimeControl03-dispatch-decision']

  // timeControl03EventListener\('TimeControl03-reset-all'
  const resetAll: UseActionBarReturn['resetAll'] =
    timeControl03EventDispatcher['TimeControl03-reset-all']

  // timeControl03EventListener\('TimeControl03-toggle-progress-mode'
  const toggleProgressMode: UseActionBarReturn['toggleProgressMode'] =
    timeControl03EventDispatcher['TimeControl03-toggle-progress-mode']

  return {
    dispatchDecision,
    progressMode,
    resetAll,
    toggleProgressMode,
  }
}
