import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'

import { CarriedItemStoreProvider } from '../../../_stores/carried-items'
import {
  PlayerActivityStoreProvider,
  usePlayerActivityStoreApi,
} from '../../../_stores/player-activity'
import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import { FindPathEventProvider } from '../../index.contexts'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider>
      <PlayerActivityStoreProvider>
        <FindPathEventProvider>{props.children}</FindPathEventProvider>
      </PlayerActivityStoreProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

const renderGuard = () =>
  renderHook(
    () => ({
      dispatcher: useFindPathEventDispatcher(),
      playerActivity: usePlayerActivityStoreApi(),
    }),
    { wrapper: Wrapper },
  )

test('停止中なら経路の提示・実行を許可する', async () => {
  const { result } = renderGuard()
  const { dispatcher } = result.current

  await expect(
    dispatcher['FindPath-propose-path']({ cell: { q: 2, r: 0 } }),
  ).resolves.toBe(true)
  await expect(
    dispatcher['FindPath-execute-path']({ path: [{ q: 1, r: 0 }] }),
  ).resolves.toBe(true)
})

test('EN スポットで補給中なら経路の提示・実行を拒否する', async () => {
  const { result } = renderGuard()
  const { dispatcher, playerActivity } = result.current
  playerActivity.getState().setActivity('recovering')

  await expect(
    dispatcher['FindPath-propose-path']({ cell: { q: 2, r: 0 } }),
  ).resolves.toBe(false)
  await expect(
    dispatcher['FindPath-execute-path']({ path: [{ q: 1, r: 0 }] }),
  ).resolves.toBe(false)
})
