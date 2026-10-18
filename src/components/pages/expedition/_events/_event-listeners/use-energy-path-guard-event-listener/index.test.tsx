import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { CarriedItemStoreProvider } from '../../../_stores/carried-items'
import { MoveHistoryStoreProvider } from '../../../_stores/move-history'
import { PlayerActivityStoreProvider } from '../../../_stores/player-activity'
import { useExpeditionEventDispatcher } from '../../_hooks/use-expedition-event-dispatcher'
import { ExpeditionEventProvider } from '../../index.contexts'

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

const renderGuard = () =>
  renderHook(
    () => ({
      dispatcher: useExpeditionEventDispatcher(),
      energy: useEnergyStoreApi(),
    }),
    { wrapper: Wrapper },
  )

test('EN が残っていれば経路の提示・実行を許可する', async () => {
  const { result } = renderGuard()
  const { dispatcher } = result.current

  await expect(
    dispatcher['Expedition-propose-path']({ cell: { q: 2, r: 0 } }),
  ).resolves.toBe(true)
  await expect(
    dispatcher['Expedition-execute-path']({ path: [{ q: 1, r: 0 }] }),
  ).resolves.toBe(true)
})

test('EN 切れなら経路の提示・実行を拒否する', async () => {
  const { result } = renderGuard()
  const { dispatcher, energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)
  energy.getState().consume(PLAYER_ACTOR_ID, max)

  await expect(
    dispatcher['Expedition-propose-path']({ cell: { q: 2, r: 0 } }),
  ).resolves.toBe(false)
  await expect(
    dispatcher['Expedition-execute-path']({ path: [{ q: 1, r: 0 }] }),
  ).resolves.toBe(false)
})
