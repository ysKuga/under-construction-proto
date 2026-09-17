import { act, renderHook } from '@testing-library/react'
import { createElement, PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useEnergyStoreApi } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { DEFAULT_ENERGY_INFO } from '@/components/pages/find-path/_prototypes/_stores/energy/constants'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  ActorNodeRegistryProvider,
  useActorNodeRegistry,
} from '@/prototypes/stage/stage-07/_contexts/actor-node-registry'
import { useGameClockStoreApi } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { FindPathStoresProvider } from '../_contexts/find-path-stores'
import { GOAL_POSITION, TICK_MS } from '../constants'

import { useFindPathTick } from './use-find-path-tick'

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    FindPathStoresProvider,
    null,
    createElement(ActorNodeRegistryProvider, null, children),
  )

/** hook 本体 + 検証に使う store / registry API を同じ Provider 下で取得する */
const renderTick = () =>
  renderHook(
    () => ({
      energy: useEnergyStoreApi(),
      gameClock: useGameClockStoreApi(),
      plannedPath: usePlannedPathStoreApi(),
      registry: useActorNodeRegistry(),
      tick: useFindPathTick(),
    }),
    { wrapper },
  )

type Result = ReturnType<typeof renderTick>['result']

const cellOf = (result: Result) => result.current.registry.currentCell

const seedPlanned = (result: Result, cells: { q: number; r: number }[]) => {
  act(() => {
    result.current.plannedPath.getState().setPlannedPath(
      PLAYER_ACTOR_ID,
      cells.map((cell) => ({ x: cell.q, y: cell.r })),
    )
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('「実行」で予定経路を 1 tick ごとに 1 セルずつ消化し、歩き切ると予定経路がクリアされる', async () => {
  const { result } = renderTick()

  seedPlanned(result, [
    { q: 0, r: 1 },
    { q: 0, r: 2 },
  ])

  act(() => result.current.tick.execute())

  // 初回の tick 起算は requestAnimationFrame 後（execute 内、carry 過大蓄積対策）
  // のため、1 フレーム分の余裕を見込んで進める
  await act(() => vi.advanceTimersByTimeAsync(TICK_MS + 100))
  expect(cellOf(result)).toEqual({ q: 0, r: 1 })

  await act(() => vi.advanceTimersByTimeAsync(TICK_MS))
  expect(cellOf(result)).toEqual({ q: 0, r: 2 })

  expect(
    result.current.plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID),
  ).toEqual([])
  expect(result.current.tick.isRunning).toBe(false)
})

test('ゴールセルに到達すると reachedGoal が true になる', async () => {
  const { result } = renderTick()

  seedPlanned(result, [GOAL_POSITION])

  act(() => result.current.tick.execute())
  expect(result.current.tick.reachedGoal).toBe(false)

  await act(() => vi.advanceTimersByTimeAsync(TICK_MS + 100))
  expect(cellOf(result)).toEqual(GOAL_POSITION)
  expect(result.current.tick.reachedGoal).toBe(true)
})

test('エネルギーが尽きると tick ループが停止する（ゴール未達）', async () => {
  const { result } = renderTick()

  seedPlanned(result, [
    { q: 0, r: 1 },
    { q: 0, r: 2 },
    { q: 0, r: 3 },
  ])

  act(() => {
    result.current.energy
      .getState()
      .consume(PLAYER_ACTOR_ID, DEFAULT_ENERGY_INFO.current - 1)
  })

  act(() => result.current.tick.execute())
  await act(() => vi.advanceTimersByTimeAsync(TICK_MS * 5))

  // 残エネルギー=1 のため 1 マスだけ消化して停止する
  expect(cellOf(result)).toEqual({ q: 0, r: 1 })
  expect(result.current.tick.isRunning).toBe(false)
  expect(result.current.tick.reachedGoal).toBe(false)
  expect(
    result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
  ).toBe(0)
  expect(
    result.current.plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID),
  ).toEqual([])
})
