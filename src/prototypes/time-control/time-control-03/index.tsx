import { ActionBar } from './_components/action-bar'
import { ActionLogPanel } from './_components/action-log-panel'
import { ActorController } from './_components/actor-controller'
import { SchedulePreview } from './_components/schedule-preview'
import { StageView } from './_components/stage-view'
import { StoresProvider } from './_stores/index.contexts'
import { ActorId } from './types'

type TimeControl03Props = {
  /** 表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * 複数 actor の移動と履歴管理のデモ (time-control-02 の store 責務分割版)
 *
 * - actor ごとに `set target` (企図) のみ行い、`行動決定` (実行) は全 actor 一括で\
 *   `ActionBar` から行う
 * - 履歴パネルは共通ゲームクロック (`game-clock-store`) の eventLog のみ、各 actor 行は\
 *   自身の position のみを購読する
 */
export const TimeControl03 = (props: TimeControl03Props) => {
  const { actorIds } = props

  return (
    <StoresProvider>
      <ActionBar actorIds={actorIds} />
      <div className="flex gap-4">
        <StageView actorIds={actorIds} />
        <ul className="ui-container">
          {actorIds.map((id) => (
            <ActorController id={id} key={id} />
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
    </StoresProvider>
  )
}
