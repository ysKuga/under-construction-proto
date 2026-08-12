import { memo } from 'react'

import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { usePathStore } from '../../_contexts/path-store-context'
import { buildSchedule } from '../../_lib/build-schedule'
import { useActorStore } from '../../_stores/actor'
import { useGameClockStore } from '../../_stores/game-clock'
import { ActorId } from '../../types'

type SchedulePreviewProps = {
  /** 列として表示する actor の一覧 */
  actorIds: ActorId[]
}

type ScheduleCellProps = {
  /** この行 (tick) で行動があるか */
  hasAction: boolean
}

/**
 * actor 1体分・1行分のセル (memo により hasAction 不変時は再レンダリングされない)
 */
const ScheduleCell = memo((props: ScheduleCellProps) => {
  const { hasAction } = props

  return (
    <TableCell className="whitespace-nowrap">{hasAction ? '●' : ''}</TableCell>
  )
})

ScheduleCell.displayName = 'ScheduleCell'

/**
 * 行動決定前のスケジュールプレビュー
 *
 * - 各 actor の残り経路 (`pathById`) から tick タイミングを共通ゲームクロック起点でマージし、\
 *   同時刻の tick は1行にまとめて表示する
 * - `pathById`/`actorById` 全体を購読するため、いずれかの actor の経路が\
 *   変化するたびに行データ自体は再計算される。ただし各セルは `ScheduleCell` として\
 *   memo 化しているため、`hasAction` が変化しない列は DOM 再描画されない
 * - 経過時間は行ごとに専用列 (先頭) へまとめる。actor 列には行動の有無のみ表示する\
 *   (同一行に複数 actor が並ぶ場合、経過時間を列ごとに重複表示しないため)
 */
export const SchedulePreview = (props: SchedulePreviewProps) => {
  const { actorIds } = props

  const pathById = usePathStore((state) => state.pathById)
  const actorById = useActorStore((state) => state.actorById)
  const commonGameTimeMs = useGameClockStore((state) => state.commonGameTimeMs)

  const schedule = buildSchedule(
    actorIds,
    pathById,
    actorById,
    commonGameTimeMs,
  )

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
        {schedule.map((row) => (
          <TableRow key={row.timeMs}>
            <TableCell className="whitespace-nowrap">{row.timeMs}ms</TableCell>
            {actorIds.map((id) => (
              <ScheduleCell hasAction={row.actorIds.includes(id)} key={id} />
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableElement>
  )
}
