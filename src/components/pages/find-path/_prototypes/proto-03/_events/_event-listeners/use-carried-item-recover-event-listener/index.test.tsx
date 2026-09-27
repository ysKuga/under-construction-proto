import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../../_stores/carried-items'
import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import { FindPathEventProvider } from '../../index.contexts'

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider capacity={3}>
      <FindPathEventProvider>{props.children}</FindPathEventProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

const renderListener = () =>
  renderHook(
    () => ({
      carriedItems: useCarriedItemStoreApi(),
      dispatcher: useFindPathEventDispatcher(),
      energy: useEnergyStoreApi(),
    }),
    { wrapper: Wrapper },
  )

test('携行中アイテムを使用すると EN が回復し、携行から取り除かれる', async () => {
  const { result } = renderListener()
  const { carriedItems, dispatcher, energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)
  energy.getState().consume(PLAYER_ACTOR_ID, max)
  carriedItems.getState().pickUp({
    amount: 3,
    cell: { q: 1, r: 1 },
    id: 'item-1',
    kind: 'energy-recovery',
  })

  await expect(
    dispatcher['FindPath-use-carried-item'](undefined),
  ).resolves.toBe(true)
  expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(3)
  expect(carriedItems.getState().carriedItems).toEqual([])
})

test('携行が空なら使用を拒否する', async () => {
  const { result } = renderListener()
  const { dispatcher } = result.current

  await expect(
    dispatcher['FindPath-use-carried-item'](undefined),
  ).resolves.toBe(false)
})
