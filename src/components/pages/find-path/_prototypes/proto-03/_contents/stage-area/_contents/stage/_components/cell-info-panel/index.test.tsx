import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'
import {
  ActorsStoreProvider,
  useActorsStoreApi,
} from '@/prototypes/stage/stage-07/_stores/actors'

import { GoalStoreProvider, useGoalStore } from '../../../../../../_stores/goal'
import { ItemStoreProvider } from '../../../../../../_stores/items'
import { ItemInstance } from '../../../../../../_stores/items/types'
import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../../_stores/waypoint-flow'
import {
  GOAL_POSITION,
  OBSTACLE_CELLS,
  START_POSITION,
} from '../../../../../../constants'

import { OBJECTIVE_CANCEL_HINT, useCellInfoPanel } from './index.hooks'

vi.unmock('zustand')

/** EN スポット（残り 2 回） */
const SPOT: ItemInstance = {
  amount: 1,
  cell: { q: 0, r: 1 },
  id: 'spot-1',
  kind: 'energy-charge',
  stock: 2,
}

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <ActorsStoreProvider initialActors={{ [PLAYER_ACTOR_ID]: START_POSITION }}>
      <Stage07EventProvider>
        <ItemStoreProvider initialItems={[SPOT]}>
          <WaypointFlowStoreProvider>
            <GoalStoreProvider>{props.children}</GoalStoreProvider>
          </WaypointFlowStoreProvider>
        </ItemStoreProvider>
      </Stage07EventProvider>
    </ActorsStoreProvider>
  </EnergyStoreProvider>
)

/** hook の戻り値と描画回数・hover 発行を返す */
const renderCellInfoPanel = () => {
  /** 描画回数 */
  let renderCount = 0
  const view = renderHook(
    () => {
      renderCount += 1

      return {
        actors: useActorsStoreApi(),
        cellInfoPanel: useCellInfoPanel(),
        dispatcher: useStage07EventDispatcher(),
        energy: useEnergyStoreApi(),
        reachGoal: useGoalStore((state) => state.reach),
        waypointFlow: useWaypointFlowStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )
  /** `Stage07-cell-hover` を発行する */
  const hover = (cell: ItemInstance['cell'] | undefined) =>
    act(async () => {
      await view.result.current.dispatcher['Stage07-cell-hover']({ cell })
    })

  return { getHookCallCount: () => renderCount, hover, ...view }
}

test('hover なしは要素一覧を返さない', () => {
  const { result } = renderCellInfoPanel()

  expect(result.current.cellInfoPanel.hoveredCell).toBeUndefined()
  expect(result.current.cellInfoPanel.entries).toEqual([])
})

test('障害物のセルは障害物を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(OBSTACLE_CELLS[0])

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: 'obstacle' }),
  ])
})

test('EN スポットのセルは残り回数を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(SPOT.cell)

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: SPOT.id, status: '残り 2 回' }),
  ])
})

test('同じセルへの hover 通知では再レンダリングしない', async () => {
  const { getHookCallCount, hover } = renderCellInfoPanel()

  await hover(SPOT.cell)
  /** 1回目の hover 後の hook 呼出回数（= 描画回数） */
  const callCountAfterHover = getHookCallCount()
  await hover({ ...SPOT.cell })

  expect(getHookCallCount()).toBe(callCountAfterHover)
})

test('hover 解除で要素一覧を返さない', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(SPOT.cell)
  await hover(undefined)

  expect(result.current.cellInfoPanel.hoveredCell).toBeUndefined()
  expect(result.current.cellInfoPanel.entries).toEqual([])
})

test('経路提示中の目標セルにキャンセルの操作ヒントを返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  act(() => {
    result.current.waypointFlow.getState().propose({ q: 2, r: 3 })
  })
  await hover({ q: 2, r: 3 })

  expect(result.current.cellInfoPanel.hint).toBe(OBJECTIVE_CANCEL_HINT)
})

test('中継点選択中の目標セルには操作ヒントを返さない', async () => {
  const { hover, result } = renderCellInfoPanel()

  act(() => {
    result.current.waypointFlow.getState().propose({ q: 2, r: 3 })
    result.current.waypointFlow.getState().setFlowState('selecting')
  })
  await hover({ q: 2, r: 3 })

  expect(result.current.cellInfoPanel.hint).toBeUndefined()
})

test('bot のいるセルは bot と EN を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(START_POSITION)

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: 'bot', status: 'EN 10/10' }),
  ])
})

test('EN スポット上の bot は bot とスポットの両方を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  act(() => {
    result.current.actors.getState().moveActor(PLAYER_ACTOR_ID, SPOT.cell)
  })
  await hover(SPOT.cell)

  expect(
    result.current.cellInfoPanel.entries.map((entry) => entry.key),
  ).toEqual(['bot', SPOT.id])
})

test('ゴールのセルはゴールと到達状況を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(GOAL_POSITION)

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: 'goal', status: undefined }),
  ])

  act(() => {
    result.current.reachGoal()
  })

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: 'goal', status: '到達済み' }),
  ])
})

test('bot のいないセルの hover 中は EN が変わっても再レンダリングしない', async () => {
  const { getHookCallCount, hover, result } = renderCellInfoPanel()

  await hover(SPOT.cell)
  /** hover 後の hook 呼出回数（= 描画回数） */
  const callCountAfterHover = getHookCallCount()
  act(() => {
    result.current.energy.getState().consume(PLAYER_ACTOR_ID, 1)
  })

  expect(getHookCallCount()).toBe(callCountAfterHover)
})
