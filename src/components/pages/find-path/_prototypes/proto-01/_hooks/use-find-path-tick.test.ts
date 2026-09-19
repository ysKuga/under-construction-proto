import { act, renderHook } from '@testing-library/react'
import { createElement, PropsWithChildren } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { useEnergyStoreApi } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { DEFAULT_ENERGY_INFO } from '@/components/pages/find-path/_prototypes/_stores/energy/constants'
import {
  ActorNodeRegistryProvider,
  useActorNodeRegistry,
} from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
import {
  CELL_TRANSITION_MS,
  PLAYER_ACTOR_ID,
} from '@/prototypes/stage/stage-06/constants'
import { useGameClockStoreApi } from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import { usePlannedPathStoreApi } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { FindPathStoresProvider } from '../_contexts/find-path-stores'
import { PlannedPathCellRegistryProvider } from '../_contexts/planned-path-cell-registry'
import { useItemStoreApi } from '../_stores/items'
import {
  GOAL_POSITION,
  OBSTACLE_CELLS,
  RECOVERY_ITEM_CELLS,
  RECOVERY_SPOT_CELLS,
  TICK_MS,
} from '../constants'

import { useFindPathTick } from './use-find-path-tick'

const GRID = { cols: 5, rows: 5 }

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    FindPathStoresProvider,
    null,
    createElement(
      ActorNodeRegistryProvider,
      { gridSize: GRID },
      createElement(PlannedPathCellRegistryProvider, null, children),
    ),
  )

/**
 * hook 本体 + 検証に使う store / registry API を同じ Provider 下で取得する
 *
 * @param energyOut EN 切れ演出の dispatcher（省略可、発火検証時のみ渡す）
 */
const renderTick = (energyOut?: () => Promise<void>) =>
  renderHook(
    () => ({
      energy: useEnergyStoreApi(),
      gameClock: useGameClockStoreApi(),
      items: useItemStoreApi(),
      plannedPath: usePlannedPathStoreApi(),
      registry: useActorNodeRegistry(),
      tick: useFindPathTick({ energyOut }),
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

  // timeScale=1 なので 1 区間消化に CELL_TRANSITION_MS 分の実時間が要る
  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS))
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })

  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS * 2))
  expect(cellOf(result)).toEqual({ col: 3, row: 0 })

  // 枯渇後はいくら進めても動かない
  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS * 5))
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

  // 4 倍速: CELL_TRANSITION_MS / 4 の実時間で 1 区間
  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS / 4))
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })

  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS / 4))
  expect(cellOf(result)).toEqual({ col: 2, row: 0 })
})

test('timeScale=0 の間は進まない（ポーズ）', () => {
  const { result } = renderTick()

  seedPlanned(result, [{ col: 1, row: 0 }])

  act(() => {
    result.current.gameClock.getState().setTimeScale(0)
  })
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS * 10))

  expect(cellOf(result)).toEqual({ col: 0, row: 0 })

  // 再開すると続きから消化する
  act(() => {
    result.current.gameClock.getState().setTimeScale(1)
  })
  act(() => vi.advanceTimersByTime(CELL_TRANSITION_MS))
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })
})

test('走行中は isRunning が true になり、歩き切ると false に戻る', () => {
  const { result } = renderTick()

  seedPlanned(result, [{ col: 1, row: 0 }])
  expect(result.current.tick.isRunning).toBe(false)

  act(() => result.current.tick.execute())
  expect(result.current.tick.isRunning).toBe(true)

  act(() => vi.advanceTimersByTime(TICK_MS))
  expect(result.current.tick.isRunning).toBe(false)
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

test('次マスが障害物なら moveActor をスキップするが、経路自体は消化される', () => {
  const { result } = renderTick()
  const obstacle = OBSTACLE_CELLS[0]

  seedPlanned(result, [obstacle, { col: 4, row: 4 }])

  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 2))

  // 障害物セルへは移動せず、その次の指定まで消化される
  expect(cellOf(result)).toEqual({ col: 4, row: 4 })
  expect(
    result.current.plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID),
  ).toEqual([])
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

test('回復アイテムのマスに到達すると EN が回復する', () => {
  const { result } = renderTick()
  const item = RECOVERY_ITEM_CELLS[0]

  act(() => {
    result.current.energy.getState().consume(PLAYER_ACTOR_ID, 5)
  })

  seedPlanned(result, [{ col: 1, row: 0 }, item])
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 2))

  // 5(初期消費) + 2(移動2手分の消費) - 3(回復量) = 4 減
  expect(
    result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
  ).toBe(10 - 5 - 2 + item.amount)
  // 使い切りのため store から削除される
  expect(result.current.items.getState().getItemAtCell(item)).toBeUndefined()
})

test('回復スポットは指定回数のみ回復し、枯渇後は回復しない', () => {
  const { result } = renderTick()
  const spot = RECOVERY_SPOT_CELLS[0]
  const adjacent = { col: spot.col, row: spot.row - 1 }

  act(() => {
    result.current.energy.getState().consume(PLAYER_ACTOR_ID, 9)
  })

  // spot と隣接マスを往復し、stock(2回)を超えて3回踏む
  seedPlanned(result, [spot, adjacent, spot, adjacent, spot])
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 5))

  // 1: current=1→(+2→3)→consume→2 / 2: 2→1 / 3: 1→(+2→3)→consume→2
  // 4: 2→1 / 5(枯渇後、回復なし): 1→consume→0
  expect(
    result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
  ).toBe(0)
  expect(result.current.items.getState().getItemAtCell(spot)).toBeUndefined()
})

test('エネルギーが尽きると tick ループが停止する（ゴール未達）', () => {
  const { result } = renderTick()

  seedPlanned(result, [
    { col: 1, row: 0 },
    { col: 2, row: 0 },
    { col: 3, row: 0 },
  ])

  act(() => {
    result.current.energy
      .getState()
      .consume(PLAYER_ACTOR_ID, DEFAULT_ENERGY_INFO.current - 1)
  })

  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS * 5))

  // 残エネルギー=1 のため 1 マスだけ消化して停止する
  expect(cellOf(result)).toEqual({ col: 1, row: 0 })
  expect(result.current.tick.isRunning).toBe(false)
  expect(result.current.tick.reachedGoal).toBe(false)
  expect(
    result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
  ).toBe(0)
  expect(
    result.current.plannedPath.getState().getPlannedPath(PLAYER_ACTOR_ID),
  ).toEqual([])
})

test('EN 切れで energyOut が発火する', () => {
  const energyOut = vi.fn<() => Promise<void>>(() => Promise.resolve())
  const { result } = renderTick(energyOut)

  seedPlanned(result, [{ col: 1, row: 0 }])
  act(() => {
    result.current.energy
      .getState()
      .consume(PLAYER_ACTOR_ID, DEFAULT_ENERGY_INFO.current - 1)
  })

  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS))

  expect(energyOut).toHaveBeenCalledTimes(1)
})

test('通常の回復（EN 切れを経ていない）では energyOut は発火しない', () => {
  const energyOut = vi.fn<() => Promise<void>>(() => Promise.resolve())
  const { result } = renderTick(energyOut)
  const item = RECOVERY_ITEM_CELLS[0]

  seedPlanned(result, [item])
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS))

  expect(energyOut).not.toHaveBeenCalled()
})

test('EN 切れ後、回復アイテムへ到達すると energyOut が再度発火する（復帰）', () => {
  const energyOut = vi.fn<() => Promise<void>>(() => Promise.resolve())
  const { result } = renderTick(energyOut)
  const item = RECOVERY_ITEM_CELLS[0]

  seedPlanned(result, [{ col: 1, row: 0 }])
  act(() => {
    result.current.energy
      .getState()
      .consume(PLAYER_ACTOR_ID, DEFAULT_ENERGY_INFO.current - 1)
  })

  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS))
  expect(energyOut).toHaveBeenCalledTimes(1)

  // 停止後、別経路で回復アイテムのマスへ向けて再度「実行」する
  seedPlanned(result, [item])
  act(() => result.current.tick.execute())
  act(() => vi.advanceTimersByTime(TICK_MS))

  expect(energyOut).toHaveBeenCalledTimes(2)
})
