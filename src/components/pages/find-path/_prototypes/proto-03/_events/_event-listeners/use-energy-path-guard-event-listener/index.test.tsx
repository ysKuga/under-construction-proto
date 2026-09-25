import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import { FindPathEventProvider } from '../../index.contexts'

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <FindPathEventProvider>{props.children}</FindPathEventProvider>
  </EnergyStoreProvider>
)

const renderGuard = () =>
  renderHook(
    () => ({
      dispatcher: useFindPathEventDispatcher(),
      energy: useEnergyStoreApi(),
    }),
    { wrapper: Wrapper },
  )

test('EN が残っていれば経路の提示・実行を許可する', async () => {
  const { result } = renderGuard()
  const { dispatcher } = result.current

  await expect(
    dispatcher['FindPath-propose-path']({ cell: { q: 2, r: 0 } }),
  ).resolves.toBe(true)
  await expect(
    dispatcher['FindPath-execute-path']({ path: [{ q: 1, r: 0 }] }),
  ).resolves.toBe(true)
})

test('EN 切れなら経路の提示・実行を拒否する', async () => {
  const { result } = renderGuard()
  const { dispatcher, energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)
  energy.getState().consume(PLAYER_ACTOR_ID, max)

  await expect(
    dispatcher['FindPath-propose-path']({ cell: { q: 2, r: 0 } }),
  ).resolves.toBe(false)
  await expect(
    dispatcher['FindPath-execute-path']({ path: [{ q: 1, r: 0 }] }),
  ).resolves.toBe(false)
})
