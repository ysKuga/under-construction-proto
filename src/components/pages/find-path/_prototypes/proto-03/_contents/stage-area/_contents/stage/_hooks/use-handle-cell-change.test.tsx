import { act, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { StageLayoutProvider } from '../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../_contexts/stage-layout/constants'
import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../../../../_stores/carried-items'
import { EnergySettingsStoreProvider } from '../../../../../_stores/energy-settings'
import { FogStoreProvider } from '../../../../../_stores/fog'
import {
  FollowPathStoreProvider,
  useFollowPathStoreApi,
} from '../../../../../_stores/follow-path'
import { GoalStoreProvider } from '../../../../../_stores/goal'
import {
  ItemStoreProvider,
  useItemStoreApi,
} from '../../../../../_stores/items'
import { ItemInstance } from '../../../../../_stores/items/types'
import {
  MoveHistoryStoreProvider,
  useMoveHistoryStoreApi,
} from '../../../../../_stores/move-history'
import { WaypointFlowStoreProvider } from '../../../../../_stores/waypoint-flow'

import { useHandleCellChange } from './use-handle-cell-change'

vi.unmock('zustand')

const CHARGE_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-1',
  kind: 'energy-charge',
}

const CHARGE_SPOT: ItemInstance = {
  amount: 2,
  cell: { q: 0, r: 3 },
  id: 'spot-1',
  kind: 'energy-charge',
  stock: 2,
}

const createWrapper = (capacity?: number) => (props: PropsWithChildren) => (
  <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
    <EnergyStoreProvider>
      <CarriedItemStoreProvider capacity={capacity}>
        <ItemStoreProvider initialItems={[CHARGE_ITEM, CHARGE_SPOT]}>
          <FogStoreProvider initialMode="all-visible">
            <WaypointFlowStoreProvider>
              <EnergySettingsStoreProvider>
                <GoalStoreProvider>
                  <FollowPathStoreProvider>
                    <MoveHistoryStoreProvider>
                      {props.children}
                    </MoveHistoryStoreProvider>
                  </FollowPathStoreProvider>
                </GoalStoreProvider>
              </EnergySettingsStoreProvider>
            </WaypointFlowStoreProvider>
          </FogStoreProvider>
        </ItemStoreProvider>
      </CarriedItemStoreProvider>
    </EnergyStoreProvider>
  </StageLayoutProvider>
)

const renderHandleCellChange = (capacity?: number) =>
  renderHook(
    () => ({
      carriedItems: useCarriedItemStoreApi(),
      energy: useEnergyStoreApi(),
      followPath: useFollowPathStoreApi(),
      handleCellChange: useHandleCellChange(),
      items: useItemStoreApi(),
      moveHistory: useMoveHistoryStoreApi(),
    }),
    { wrapper: createWrapper(capacity) },
  )

test('EN 補給アイテムを踏むと即時補給せず携行し、その場から取り除く', async () => {
  const { result } = renderHandleCellChange()
  const { max } = result.current.energy
    .getState()
    .getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => result.current.handleCellChange(CHARGE_ITEM.cell))

  expect(result.current.carriedItems.getState().carriedItems).toEqual([
    CHARGE_ITEM,
  ])
  expect(
    result.current.items.getState().getItemAtCell(CHARGE_ITEM.cell),
  ).toBeUndefined()
  // 移動分の消費のみで補給しない
  await waitFor(() =>
    expect(
      result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
    ).toBe(max - 1),
  )
})

test('携行が上限なら EN 補給アイテムはその場に残る', () => {
  const { result } = renderHandleCellChange(0)

  act(() => result.current.handleCellChange(CHARGE_ITEM.cell))

  expect(result.current.carriedItems.getState().carriedItems).toEqual([])
  expect(
    result.current.items.getState().getItemAtCell(CHARGE_ITEM.cell),
  ).toEqual(CHARGE_ITEM)
})

test('EN スポットは携行せず、踏んでも補給しない', async () => {
  const { result } = renderHandleCellChange()
  const { energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => result.current.handleCellChange(CHARGE_SPOT.cell))

  expect(result.current.carriedItems.getState().carriedItems).toEqual([])
  expect(
    result.current.items.getState().getItemAtCell(CHARGE_SPOT.cell),
  ).toEqual(CHARGE_SPOT)
  // 移動分の消費のみで補給しない
  await waitFor(() =>
    expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(
      max - 1,
    ),
  )
})

test('隣接セルへの直接移動は 1 手として記録する', () => {
  const { result } = renderHandleCellChange()

  act(() => result.current.handleCellChange({ q: 1, r: 0 }))

  expect(result.current.moveHistory.getState().entries).toEqual([
    { kind: 'move', path: [{ q: 1, r: 0 }] },
  ])
})

test('自動移動中の移動は記録しない（「実行」時に経路ごと記録済み）', () => {
  const { result } = renderHandleCellChange()

  act(() => result.current.followPath.getState().start([{ q: 1, r: 0 }]))
  act(() => result.current.handleCellChange({ q: 1, r: 0 }))

  expect(result.current.moveHistory.getState().entries).toEqual([])
})
