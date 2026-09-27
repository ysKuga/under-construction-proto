import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { CarriedItemStoreProvider } from '../../../_stores/carried-items'
import { ItemInstance } from '../../../_stores/items/types'
import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import { FindPathEventProvider } from '../../index.contexts'

const RECOVERY_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-1',
  kind: 'energy-recovery',
}

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider>
      <FindPathEventProvider>{props.children}</FindPathEventProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

test('recover-energy で使用されたアイテムの amount 分 EN を回復する', async () => {
  const { result } = renderHook(
    () => ({
      dispatcher: useFindPathEventDispatcher(),
      energy: useEnergyStoreApi(),
    }),
    { wrapper: Wrapper },
  )
  const { dispatcher, energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)
  energy.getState().consume(PLAYER_ACTOR_ID, max)

  await dispatcher['FindPath-item-used']({
    item: RECOVERY_ITEM,
    usage: 'recover-energy',
  })

  expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(3)
})
