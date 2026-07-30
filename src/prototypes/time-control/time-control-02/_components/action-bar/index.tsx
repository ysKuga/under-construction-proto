import { Button } from '@/components/ui/button'

import { useActorStore } from '../../_contexts/actor-store-context'
import { DEFAULT_PROGRESS_MODE } from '../../_stores/actor-store'
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
 * - reset: 全 actor の状態を初期状態に戻す
 */
export const ActionBar = (props: ActionBarProps) => {
  const { actorIds } = props

  const progressMode = useActorStore(
    (state) => state.progressModeById[actorIds[0]] ?? DEFAULT_PROGRESS_MODE,
  )
  const dispatchAction = useActorStore((state) => state.dispatchAction)
  const reset = useActorStore((state) => state.reset)
  const setProgressMode = useActorStore((state) => state.setProgressMode)

  return (
    <div className="flex gap-2 p-2">
      <Button
        onClick={() => {
          actorIds.forEach((id) => dispatchAction(id))
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
      <Button onClick={reset} type="button" variant="destructive">
        reset
      </Button>
    </div>
  )
}
