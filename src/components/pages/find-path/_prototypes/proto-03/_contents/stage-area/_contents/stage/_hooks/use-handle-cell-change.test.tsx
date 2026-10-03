import { act, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../../../../_stores/carried-items'
import { EnergySettingsStoreProvider } from '../../../../../_stores/energy-settings'
import { FogStoreProvider } from '../../../../../_stores/fog'
import { GoalStoreProvider } from '../../../../../_stores/goal'
import {
  ItemStoreProvider,
  useItemStoreApi,
} from '../../../../../_stores/items'
import { ItemInstance } from '../../../../../_stores/items/types'
import { WaypointFlowStoreProvider } from '../../../../../_stores/waypoint-flow'

import { useHandleCellChange } from './use-handle-cell-change'

vi.unmock('zustand')

const RECOVERY_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-1',
  kind: 'energy-recovery',
}

const RECOVERY_SPOT: ItemInstance = {
  amount: 2,
  cell: { q: 0, r: 3 },
  id: 'spot-1',
  kind: 'energy-recovery',
  stock: 2,
}

const createWrapper = (capacity?: number) => (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider capacity={capacity}>
      <ItemStoreProvider initialItems={[RECOVERY_ITEM, RECOVERY_SPOT]}>
        <FogStoreProvider initialMode="all-visible">
          <WaypointFlowStoreProvider>
            <EnergySettingsStoreProvider>
              <GoalStoreProvider>{props.children}</GoalStoreProvider>
            </EnergySettingsStoreProvider>
          </WaypointFlowStoreProvider>
        </FogStoreProvider>
      </ItemStoreProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

const renderHandleCellChange = (capacity?: number) =>
  renderHook(
    () => ({
      carriedItems: useCarriedItemStoreApi(),
      energy: useEnergyStoreApi(),
      handleCellChange: useHandleCellChange(),
      items: useItemStoreApi(),
    }),
    { wrapper: createWrapper(capacity) },
  )

test('EN 補給アイテムを踏むと即時補給せず携行し、その場から取り除く', async () => {
  const { result } = renderHandleCellChange()
  const { max } = result.current.energy
    .getState()
    .getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => result.current.handleCellChange(RECOVERY_ITEM.cell))

  expect(result.current.carriedItems.getState().carriedItems).toEqual([
    RECOVERY_ITEM,
  ])
  expect(
    result.current.items.getState().getItemAtCell(RECOVERY_ITEM.cell),
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

  act(() => result.current.handleCellChange(RECOVERY_ITEM.cell))

  expect(result.current.carriedItems.getState().carriedItems).toEqual([])
  expect(
    result.current.items.getState().getItemAtCell(RECOVERY_ITEM.cell),
  ).toEqual(RECOVERY_ITEM)
})

test('EN スポットは携行せず、踏んでも補給しない', async () => {
  const { result } = renderHandleCellChange()
  const { energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => result.current.handleCellChange(RECOVERY_SPOT.cell))

  expect(result.current.carriedItems.getState().carriedItems).toEqual([])
  expect(
    result.current.items.getState().getItemAtCell(RECOVERY_SPOT.cell),
  ).toEqual(RECOVERY_SPOT)
  // 移動分の消費のみで補給しない
  await waitFor(() =>
    expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(
      max - 1,
    ),
  )
})
