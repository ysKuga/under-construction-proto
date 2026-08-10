import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { buildHistory } from '../../../time-control-02/_lib/build-history'
import { formatCoord } from '../../../time-control-02/_lib/format-coord'
import { useGameClockStore } from '../../_contexts/game-clock-store-context'
import { ActorId } from '../../types'

type ActionLogPanelProps = {
  /** 列として表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * eventLog のみを購読する履歴パネル。actor の position 更新では再レンダリングされない
 *
 * - `SchedulePreview` と同じ構造: 先頭に経過時間 (`gameTimeMs`) 列、続けて actor 列
 * - `gameTimeMs` は共通ゲームクロック由来の決定論的な値
 * - intent は actor 行 (`ActorController`) 側で表示するため、タイムラインには含めない
 */
export const ActionLogPanel = (props: ActionLogPanelProps) => {
  const { actorIds } = props

  const eventLog = useGameClockStore((state) => state.eventLog)

  const rows = buildHistory(actorIds, eventLog)

  return (
    <TableElement className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead>経過時間</TableHead>
          {actorIds.map((id) => (
            <TableHead key={id}>{id}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.gameTimeMs}>
            <TableCell className="whitespace-nowrap">
              {row.gameTimeMs}ms
            </TableCell>
            {actorIds.map((id) => {
              const entry = row.entryByActorId[id]

              return (
                <TableCell className="whitespace-nowrap" key={id}>
                  {entry
                    ? `${entry.phase} (${formatCoord(entry.target.x)}, ${formatCoord(entry.target.y)})`
                    : ''}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </TableElement>
  )
}
