import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { CarriedItemStoreProvider } from '../../../_stores/carried-items'
import { ItemInstance } from '../../../_stores/items/types'
import { MoveHistoryStoreProvider } from '../../../_stores/move-history'
import { PlayerActivityStoreProvider } from '../../../_stores/player-activity'
import { useExpeditionEventDispatcher } from '../../_hooks/use-expedition-event-dispatcher'
import { ExpeditionEventProvider } from '../../index.contexts'

const CHARGE_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-1',
  kind: 'energy-charge',
}

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <MoveHistoryStoreProvider>
      <CarriedItemStoreProvider>
        <PlayerActivityStoreProvider>
          <ExpeditionEventProvider>{props.children}</ExpeditionEventProvider>
        </PlayerActivityStoreProvider>
      </CarriedItemStoreProvider>
    </MoveHistoryStoreProvider>
  </EnergyStoreProvider>
)

test('charge-energy で使用されたアイテムの amount 分 EN を補給する', async () => {
  const { result } = renderHook(
    () => ({
      dispatcher: useExpeditionEventDispatcher(),
      energy: useEnergyStoreApi(),
    }),
    { wrapper: Wrapper },
  )
  const { dispatcher, energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)
  energy.getState().consume(PLAYER_ACTOR_ID, max)

  await dispatcher['Expedition-item-used']({
    item: CHARGE_ITEM,
    usage: 'charge-energy',
  })

  expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(3)
})
