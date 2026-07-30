import { DEFAULT_TICK_RATE } from '../_stores/actor-store'
import { ActorId, MovePath, ScheduleRow } from '../types'

import { getTickMs } from './get-tick-ms'

/**
 * 各 actor の残り経路から、tick タイミングを実時間でマージしたスケジュールを生成する
 *
 * - 同一時刻に複数 actor の tick が重なる場合は1行にまとめる
 * - `tickCountById` (累積 tick 数) を起点に数えるため、履歴 (`buildHistory`) の\
 *   `gameTimeMs` と連続した絶対時間になる
 *
 * @param actorIds 対象 actor 一覧
 * @param movePathById actor ごとの残り経路
 * @param tickCountById actor ごとの累積 tick 数
 * @param tickRateById actor ごとの tick 発生頻度
 */
export const buildSchedule = (
  actorIds: ActorId[],
  movePathById: Record<ActorId, MovePath>,
  tickCountById: Record<ActorId, number>,
  tickRateById: Record<ActorId, number>,
): ScheduleRow[] => {
  const actorIdsByTime = new Map<number, ActorId[]>()

  for (const actorId of actorIds) {
    const path = movePathById[actorId] ?? []
    const tickCount = tickCountById[actorId] ?? 0
    const tickMs = getTickMs(tickRateById[actorId] ?? DEFAULT_TICK_RATE)

    path.forEach((_, index) => {
      const timeMs = (tickCount + index + 1) * tickMs
      const list = actorIdsByTime.get(timeMs) ?? []

      list.push(actorId)
      actorIdsByTime.set(timeMs, list)
    })
  }

  return [...actorIdsByTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timeMs, ids]) => ({ actorIds: ids, timeMs }))
}
