import { useActorSettingsStore } from '../../../_stores'
import { ActionBarProps, UseActionBarReturn } from '../index.types'

/**
 * 進行モード(auto/manual)取得・全 actor 一括切替
 *
 * @param props ActionBar に渡される props
 */
export const useProgressMode = (
  props: ActionBarProps,
): Pick<UseActionBarReturn, 'progressMode' | 'toggleProgressMode'> => {
  const { actorIds } = props

  // 全 actor 常に同一 mode 前提の代表値取得。
  // actor 毎 個別 mode 持たせる要件が復活したら要見直し(toggleProgressMode の forEach 一括更新も同様)
  // * あるいは progressMode を統一してそれを保持する store を新設
  const progressMode = useActorSettingsStore(
    (state) => state.getActorSettings(actorIds[0]).progressMode,
  )
  const setProgressMode = useActorSettingsStore(
    (state) => state.setProgressMode,
  )

  const toggleProgressMode = () => {
    const nextMode = progressMode === 'auto' ? 'manual' : 'auto'
    actorIds.forEach((id) => setProgressMode(id, nextMode))
  }

  return { progressMode, toggleProgressMode }
}
