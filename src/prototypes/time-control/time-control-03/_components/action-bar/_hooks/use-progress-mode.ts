import { useActorSettingsStore } from '../../../_stores'
import { useTimeControl03Props } from '../../../index.contexts'
import { UseActionBarReturn } from '../index.types'

/**
 * 進行モード(auto/manual)取得・全 actor 一括切替
 */
export const useProgressMode = (): Pick<
  UseActionBarReturn,
  'progressMode' | 'toggleProgressMode'
> => {
  const { actorIds } = useTimeControl03Props()

  // 全 actor 常に同一 mode 前提の代表値取得。
  // actor 毎 個別 mode 持たせる要件が復活したら要見直し(store 側の toggleProgressMode 一括更新も同様)
  // * あるいは progressMode を統一してそれを保持する store を新設
  const progressMode = useActorSettingsStore(
    (state) => state.getActorSettings(actorIds[0]).progressMode,
  )
  const toggleProgressModeStore = useActorSettingsStore(
    (state) => state.toggleProgressMode,
  )

  const toggleProgressMode = () => toggleProgressModeStore(actorIds)

  return { progressMode, toggleProgressMode }
}
