import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import {
  FindPathEventProvider,
  useFindPathEventDispatcher,
} from '../../../../../_events'
import { CarriedItemStoreProvider } from '../../../../../_stores/carried-items'
import {
  ItemStoreProvider,
  useItemStoreApi,
} from '../../../../../_stores/items'
import { ItemInstance } from '../../../../../_stores/items/types'
import {
  PlayerActivityStoreProvider,
  usePlayerActivityStoreApi,
} from '../../../../../_stores/player-activity'
import { WaypointFlowStoreProvider } from '../../../../../_stores/waypoint-flow'
import { ENERGY_SPOT_CHARGE_INTERVAL_MS } from '../../../../../constants'

import { useEnergySpotUseEventListener } from './use-energy-spot-use-event-listener'

vi.unmock('zustand')

const CHARGE_SPOT: ItemInstance = {
  amount: 1,
  cell: { q: 0, r: 3 },
  id: 'spot-1',
  kind: 'energy-charge',
  stock: 4,
}

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider>
      <PlayerActivityStoreProvider>
        <FindPathEventProvider>
          <ItemStoreProvider initialItems={[CHARGE_SPOT]}>
            <ActorsStoreProvider
              initialActors={{ [PLAYER_ACTOR_ID]: CHARGE_SPOT.cell }}
            >
              <WaypointFlowStoreProvider>
                {props.children}
              </WaypointFlowStoreProvider>
            </ActorsStoreProvider>
          </ItemStoreProvider>
        </FindPathEventProvider>
      </PlayerActivityStoreProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

/**
 * EN スポット上の player を、EN を `consumed` だけ消費した状態で描画する
 *
 * @param consumed 事前に消費する EN
 */
const setupEnergySpotUse = (consumed: number) => {
  const { result } = renderHook(
    () => {
      useEnergySpotUseEventListener()

      return {
        dispatcher: useFindPathEventDispatcher(),
        energy: useEnergyStoreApi(),
        items: useItemStoreApi(),
        playerActivity: usePlayerActivityStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )
  result.current.energy.getState().consume(PLAYER_ACTOR_ID, consumed)

  return result.current
}

/** player の現在の EN */
const currentEnergy = (energy: ReturnType<typeof useEnergyStoreApi>) =>
  energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

test('不足分だけ時間経過ごとに 1 ずつ補給し、完了で停止中へ戻る', async () => {
  const { dispatcher, energy, items, playerActivity } = setupEnergySpotUse(2)
  const before = currentEnergy(energy)

  await act(async () => {
    await expect(
      dispatcher['FindPath-use-energy-spot'](undefined),
    ).resolves.toBe(true)
  })

  expect(playerActivity.getState().activity).toBe('charging')

  await act(async () => {
    await vi.advanceTimersByTimeAsync(ENERGY_SPOT_CHARGE_INTERVAL_MS)
  })

  expect(currentEnergy(energy)).toBe(before + 1)
  expect(playerActivity.getState().activity).toBe('charging')

  await act(async () => {
    await vi.advanceTimersByTimeAsync(ENERGY_SPOT_CHARGE_INTERVAL_MS)
  })

  expect(currentEnergy(energy)).toBe(before + 2)
  expect(playerActivity.getState().activity).toBe('idle')
  // 残量 4 のうち 2 回分を消費する
  expect(items.getState().itemsById[CHARGE_SPOT.id].stock).toBe(2)
})

test('不足分が残量を超える場合、残量の分だけ補給する', async () => {
  const { dispatcher, energy, items } = setupEnergySpotUse(10)
  const before = currentEnergy(energy)

  await act(async () => {
    await dispatcher['FindPath-use-energy-spot'](undefined)
    await vi.advanceTimersByTimeAsync(ENERGY_SPOT_CHARGE_INTERVAL_MS * 10)
  })

  expect(currentEnergy(energy)).toBe(before + CHARGE_SPOT.stock!)
  expect(items.getState().getItemAtCell(CHARGE_SPOT.cell)).toBeUndefined()
})

test('EN が上限なら使用を拒否する', async () => {
  const { dispatcher, playerActivity } = setupEnergySpotUse(0)

  await expect(dispatcher['FindPath-use-energy-spot'](undefined)).resolves.toBe(
    false,
  )
  expect(playerActivity.getState().activity).toBe('idle')
})

test('移動中・補給中なら使用を拒否する', async () => {
  const { dispatcher, playerActivity } = setupEnergySpotUse(2)

  playerActivity.getState().setActivity('moving')

  await expect(dispatcher['FindPath-use-energy-spot'](undefined)).resolves.toBe(
    false,
  )

  playerActivity.getState().setActivity('charging')

  await expect(dispatcher['FindPath-use-energy-spot'](undefined)).resolves.toBe(
    false,
  )
})
