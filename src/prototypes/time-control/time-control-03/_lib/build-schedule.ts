import { getTickMs } from '../../time-control-02/_lib/get-tick-ms'
import { DEFAULT_ACTOR_INFO } from '../_stores/actor/constants'
import { ActorInfo } from '../_stores/actor/types'
import { ActorId, MovePath, ScheduleRow } from '../types'

/**
 * 各 actor の残り経路から、tick タイミングを共通ゲームクロック起点でマージしたスケジュールを生成する
 *
 * - 同一時刻に複数 actor の tick が重なる場合は1行にまとめる
 * - `commonGameTimeMs` (共通ゲームクロックの現在値) を起点に数えるため、履歴 (`buildHistory`) の\
 *   `gameTimeMs` と連続した値になる
 * - 複数 actor 間の実際の実行順序 (auto 進行の実時間ずれ) までは正確にシミュレートしない近似値
 *
 * @param actorIds 対象 actor 一覧
 * @param pathById actor ごとの残り経路 (`_stores/path-store.ts`)
 * @param actorById actor ごとの移動速度・tick 発生頻度 (`_stores/actor/store.ts`)
 * @param commonGameTimeMs 共通ゲームクロックの現在値 (`_stores/game-clock/store.ts`)
 */
export const buildSchedule = (
  actorIds: ActorId[],
  pathById: Record<ActorId, MovePath>,
  actorById: Record<ActorId, ActorInfo>,
  commonGameTimeMs: number,
): ScheduleRow[] => {
  const actorIdsByTime = new Map<number, ActorId[]>()

  for (const actorId of actorIds) {
    const path = pathById[actorId] ?? []
    const tickRate = actorById[actorId]?.tickRate ?? DEFAULT_ACTOR_INFO.tickRate
    const tickMs = getTickMs(tickRate)

    path.forEach((_, index) => {
      const timeMs = commonGameTimeMs + (index + 1) * tickMs
      const list = actorIdsByTime.get(timeMs) ?? []

      list.push(actorId)
      actorIdsByTime.set(timeMs, list)
    })
  }

  return [...actorIdsByTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([timeMs, ids]) => ({ actorIds: ids, timeMs }))
}
