import { buildHistory } from '../_stores/game-clock/lib'
import { ActionLogEntry, EventLog } from '../types'

const entry = (
  actorId: string,
  gameTimeMs: number,
  phase: ActionLogEntry['phase'],
): EventLog<ActionLogEntry>[number] => ({
  event: { actorId, gameTimeMs, phase, target: { x: 0, y: 0 } },
  time: Date.now(),
})

test('actionLog が空なら空配列を返す', () => {
  expect(buildHistory(['a'], [])).toEqual([])
})

test('intent は除外される', () => {
  const log = [entry('a', 0, 'intent'), entry('a', 100, 'execution')]

  expect(buildHistory(['a'], log)).toEqual([
    { entryByActorId: { a: log[1].event }, gameTimeMs: 100 },
  ])
})

test('同一 gameTimeMs の複数 actor は1行にまとまる', () => {
  const log = [
    entry('a', 100, 'execution'),
    entry('b', 100, 'execution'),
    entry('a', 200, 'resolution'),
  ]

  const history = buildHistory(['a', 'b'], log)

  expect(history).toEqual([
    {
      entryByActorId: { a: log[0].event, b: log[1].event },
      gameTimeMs: 100,
    },
    { entryByActorId: { a: log[2].event }, gameTimeMs: 200 },
  ])
})
