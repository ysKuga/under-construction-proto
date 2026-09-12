import { act, renderHook } from '@testing-library/react'
import { createElement, PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import {
  ActorNodeRegistryProvider,
  useActorNodeRegistry,
} from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useGameClockStoreApi } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { FindPathStoresProvider } from '../_contexts/find-path-stores'
import { GOAL_POSITION, TICK_MS } from '../constants'

import { useFindPathTick } from './use-find-path-tick'

const GRID = { cols: 5, rows: 5 }

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    FindPathStoresProvider,
    null,
    createElement(ActorNodeRegistryProvider, { gridSize: GRID }, children),
  )

/** hook 本体 + 検証に使う store / registry API を同じ Provider 下で取得する */
const renderTick = () =>
  renderHook(
    () => ({
      gameClock: useGameClockStoreApi(),
      plannedPath: usePlannedPathStoreApi(),
      registry: useActorNodeRegistry(),
      tick: useFindPathTick(),
    }),
    { wrapper },
  )

type Result = ReturnType<typeof renderTick>['result']

const cellOf = (result: Result) =>
  result.current.registry.getActorPosition(PLAYER_ACTOR_ID)

const seedPlanned = (result: Result, cells: { col: number; row: number }[]) => {
  act(() => {
    result.current.plannedPath.getState().setPlannedPath(
      PLAYER_ACTOR_ID,
      cells.map((cell) => ({ x: cell.col, y: cell.row })),
    )
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('「実行」で予定経路を 1 tick ごとに 1 セルずつ消化し、枯渇で止まる', () => {
  const { result } = renderTick()

  seedPlanned(result, [
    { col: 1, row: 0 },
    { col: 2, row: 0 },
    { col: 3, row: 0 },
  ])

  act(() => result.current.tick.execute())

  // timeScale=1 なので 1 tick 消化に TICK_MS 分の実時間が要る
  act(() => vi.advanceTimersByTime(TICK_MS))
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })

  act(() => vi.advanceTimersByTime(TICK_MS * 2))
  expect(cellOf(result)).toEqual({ col: 3, row: 0 })

  // 枯渇後はいくら進めても動かない
  act(() => vi.advanceTimersByTime(TICK_MS * 5))
  expect(cellOf(result)).toEqual({ col: 3, row: 0 })

  // game-clock に 3 tick 分ログされ、commonGameTimeMs が 3 * TICK_MS 進む
  expect(result.current.gameClock.getState().eventLog).toHaveLength(3)
  expect(result.current.gameClock.getState().commonGameTimeMs).toBe(TICK_MS * 3)
})

test('timeScale で消化速度が変わる', () => {
  const { result } = renderTick()

  seedPlanned(result, [
    { col: 1, row: 0 },
    { col: 2, row: 0 },
  ])

  act(() => {
    result.current.gameClock.getState().setTimeScale(4)
  })
  act(() => result.current.tick.execute())

  // 4 倍速: TICK_MS / 4 の実時間で 1 tick
  act(() => vi.advanceTimersByTime(TICK_MS / 4))
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })

  act(() => vi.advanceTimersByTime(TICK_MS / 4))
  expect(cellOf(result)).toEqual({ col: 2, row: 0 })
})

test('timeScale=0 の間は進まない（ポーズ）', () => {
  const { result } = renderTick()

  seedPlanned(result, [{ col: 1, row: 0 }])

  act(() => {
    result.current.gameClock.getState().setTimeScale(0)
  })
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 10))

  expect(cellOf(result)).toEqual({ col: 0, row: 0 })

  // 再開すると続きから消化する
  act(() => {
    result.current.gameClock.getState().setTimeScale(1)
  })
  act(() => vi.advanceTimersByTime(TICK_MS))
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })
})

test('予定経路が空なら execute しても何もしない', () => {
  const { result } = renderTick()

  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 5))

  expect(cellOf(result)).toEqual({ col: 0, row: 0 })
  expect(result.current.gameClock.getState().eventLog).toHaveLength(0)
})

test('ゴールセルに到達すると reachedGoal が true になる', () => {
  const { result } = renderTick()

  seedPlanned(result, [{ col: 1, row: 0 }, GOAL_POSITION])

  act(() => result.current.tick.execute())
  expect(result.current.tick.reachedGoal).toBe(false)

  act(() => vi.advanceTimersByTime(TICK_MS * 2))
  expect(cellOf(result)).toEqual(GOAL_POSITION)
  expect(result.current.tick.reachedGoal).toBe(true)
})

test('経路を歩き切ると予定経路がクリアされる', () => {
  const { result } = renderTick()

  seedPlanned(result, [
    { col: 1, row: 0 },
    { col: 2, row: 0 },
  ])

  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 2))

  expect(
    result.current.plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID),
  ).toEqual([])
})

test('再度「実行」すると reachedGoal がリセットされる', () => {
  const { result } = renderTick()

  seedPlanned(result, [GOAL_POSITION])
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS))
  expect(result.current.tick.reachedGoal).toBe(true)

  seedPlanned(result, [{ col: 1, row: 0 }])
  act(() => result.current.tick.execute())
  expect(result.current.tick.reachedGoal).toBe(false)
})
