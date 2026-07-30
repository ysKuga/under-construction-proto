import { useState } from 'react'

import { ActionBar } from './_components/action-bar'
import { ActionLogPanel } from './_components/action-log-panel'
import { ActorItem } from './_components/actor-item'
import { SchedulePreview } from './_components/schedule-preview'
import { StageView } from './_components/stage-view'
import { ActorStoreContext } from './_contexts/actor-store-context'
import { createActorStore } from './_stores/actor-store'
import { ActorId } from './types'

type TimeControl02Props = {
  /** 表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * 複数 actor の移動と履歴管理のデモ
 *
 * - actor ごとに `aim` (企図) のみ行い、`行動決定` (実行) は全 actor 一括で\
 *   `ActionBar` から行う
 * - 履歴パネルは actionLog のみ、各 actor 行は自身の position のみを購読する
 */
export const TimeControl02 = (props: TimeControl02Props) => {
  const { actorIds } = props

  const [store] = useState(() => createActorStore())

  return (
    <ActorStoreContext.Provider value={store}>
      <ActionBar actorIds={actorIds} />
      <div className="flex gap-4">
        <StageView actorIds={actorIds} />
        <ul className="ui-container">
          {actorIds.map((id) => (
            <ActorItem id={id} key={id} />
          ))}
        </ul>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-gray-400">
            予定 (行動決定前のスケジュールプレビュー)
          </p>
          <SchedulePreview actorIds={actorIds} />
        </div>
        <div className="flex-1">
          <p className="text-gray-400">履歴</p>
          <ActionLogPanel actorIds={actorIds} />
        </div>
      </div>
    </ActorStoreContext.Provider>
  )
}
