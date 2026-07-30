import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useActorStore } from '../../_contexts/actor-store-context'
import { buildHistory } from '../../_lib/build-history'
import { ActorId } from '../../types'

type ActionLogPanelProps = {
  /** 列として表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * actionLog のみを購読する履歴パネル。actor の position 更新では再レンダリングされない
 *
 * - `SchedulePreview` と同じ構造: 先頭に経過時間 (`gameTimeMs`) 列、続けて actor 列
 * - `gameTimeMs` は tick 由来の決定論的な値 (実時刻の揺らぎを含まない) のため、\
 *   同一 tick で複数 actor が行動した場合は1行にまとまる
 * - intent は actor 行 (`ActorItem`) 側で表示するため、タイムラインには含めない
 */
export const ActionLogPanel = (props: ActionLogPanelProps) => {
  const { actorIds } = props

  const actionLog = useActorStore((state) => state.actionLog)

  const rows = buildHistory(actorIds, actionLog)

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
                    ? `${entry.phase} (${entry.target.x}, ${entry.target.y})`
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
