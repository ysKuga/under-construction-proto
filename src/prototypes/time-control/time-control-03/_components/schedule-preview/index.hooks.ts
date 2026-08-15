import { buildSchedule } from '../../_lib/build-schedule'
import { useActorStore, useGameClockStore, usePathStore } from '../../_stores'
import { useTimeControl03Props } from '../../index.contexts'

/**
 * SchedulePreview の表示ロジック
 *
 * - 各 actor の残り経路 (`pathById`) から tick タイミングを共通ゲームクロック起点でマージし、\
 *   同時刻の tick は1行にまとめたスケジュールを返す
 */
export const useSchedulePreview = () => {
  const { actorIds } = useTimeControl03Props()

  const pathById = usePathStore((state) => state.pathById)
  const actorById = useActorStore((state) => state.actorById)
  const commonGameTimeMs = useGameClockStore((state) => state.commonGameTimeMs)

  const schedule = buildSchedule(
    actorIds,
    pathById,
    actorById,
    commonGameTimeMs,
  )

  return { actorIds, schedule }
}
