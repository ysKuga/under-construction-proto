import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useActorStore } from '../../_contexts/actor-store-context'
import { useGameClockStore } from '../../_contexts/game-clock-store-context'
import { usePathStore } from '../../_contexts/path-store-context'
import { buildSchedule } from '../../_lib/build-schedule'
import { ActorId } from '../../types'

type SchedulePreviewProps = {
  /** 列として表示する actor の一覧 */
  actorIds: ActorId[]
}

/**
 * 行動決定前のスケジュールプレビュー
 *
 * - 各 actor の残り経路 (`pathById`) から tick タイミングを共通ゲームクロック起点でマージし、\
 *   同時刻の tick は1行にまとめて表示する
 * - `pathById`/`actorById` 全体を購読するため、いずれかの actor の経路が\
 *   変化するたびに再レンダリングされる (プレビュー用途のため許容)
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
              <TableCell className="whitespace-nowrap" key={id}>
                {row.actorIds.includes(id) ? '●' : ''}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </TableElement>
  )
}
