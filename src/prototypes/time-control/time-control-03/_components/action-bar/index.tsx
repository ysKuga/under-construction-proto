import { Button } from '@/components/ui/button'

import { useActorStore } from '../../_contexts/actor-store-context'
import { useGameClockStore } from '../../_contexts/game-clock-store-context'
import { usePathStore } from '../../_contexts/path-store-context'
import { usePlannedPathStore } from '../../_contexts/planned-path-store-context'
import { usePositionStore } from '../../_contexts/position-store-context'
import {
  DEFAULT_ACTOR_SETTINGS,
  useActorSettingsStore,
} from '../../_stores/actor-settings'
import { ActorId } from '../../types'

type ActionBarProps = {
  /** 操作対象の actor 一覧 */
  actorIds: ActorId[]
}

/**
 * 全 actor 一括の操作パネル
 *
 * - 行動決定: 個別 actor の企図をまとめて実行する
 * - mode: 進行モード (auto/manual) を全 actor 一括で切り替える。\
 *   actor ごとの個別切り替えは廃止、常に全員同一モードで揃える
 * - reset: 全 store (状態を持たない intent-store 以外) を初期状態に戻す
 */
export const ActionBar = (props: ActionBarProps) => {
  const { actorIds } = props

  const progressMode = useActorSettingsStore(
    (state) =>
      state.settingsById[actorIds[0]]?.progressMode ??
      DEFAULT_ACTOR_SETTINGS.progressMode,
  )
  const setProgressMode = useActorSettingsStore(
    (state) => state.setProgressMode,
  )
  const resetActorSettings = useActorSettingsStore((state) => state.reset)
  const dispatchActions = usePositionStore((state) => state.dispatchActions)
  const resetPosition = usePositionStore((state) => state.reset)
  const resetActor = useActorStore((state) => state.reset)
  const resetPath = usePathStore((state) => state.reset)
  const resetPlannedPath = usePlannedPathStore((state) => state.reset)
  const resetGameClock = useGameClockStore((state) => state.reset)

  return (
    <div className="flex gap-2 p-2">
      <Button
        onClick={() => {
          dispatchActions(actorIds)
        }}
        type="button"
      >
        行動決定
      </Button>
      <Button
        onClick={() => {
          const nextMode = progressMode === 'auto' ? 'manual' : 'auto'
          actorIds.forEach((id) => setProgressMode(id, nextMode))
        }}
        type="button"
        variant="outline"
      >
        mode: {progressMode}
      </Button>
      <Button
        onClick={() => {
          resetActor()
          resetActorSettings()
          resetPath()
          resetPlannedPath()
          resetPosition()
          resetGameClock()
        }}
        type="button"
        variant="destructive"
      >
        reset
      </Button>
    </div>
  )
}
