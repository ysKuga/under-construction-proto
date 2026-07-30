import { ActionLogEntry, ActorId, EventLog, HistoryRow } from '../types'

/**
 * actionLog から、gameTimeMs でマージした履歴行を生成する
 *
 * - 同一 gameTimeMs の複数 actor は1行にまとめる (`buildSchedule` と同じ方針)
 * - intent は対象外 (actor 行側で表示するため)
 *
 * @param actorIds 対象 actor 一覧
 * @param actionLog 行動履歴
 */
export const buildHistory = (
  actorIds: ActorId[],
  actionLog: EventLog<ActionLogEntry>,
): HistoryRow[] => {
  const entryByActorIdByTime = new Map<
    number,
    Partial<Record<ActorId, ActionLogEntry>>
  >()

  for (const { event } of actionLog) {
    if (event.phase === 'intent' || !actorIds.includes(event.actorId)) {
      continue
    }

    const row = entryByActorIdByTime.get(event.gameTimeMs) ?? {}

    row[event.actorId] = event
    entryByActorIdByTime.set(event.gameTimeMs, row)
  }

  return [...entryByActorIdByTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([gameTimeMs, entryByActorId]) => ({ entryByActorId, gameTimeMs }))
}
