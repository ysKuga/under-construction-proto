import { act, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyEventDispatcher,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../_stores/waypoint-flow'

import { useClearWaypointFlowOnEnergyDepleted } from './use-clear-waypoint-flow-on-energy-depleted'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <WaypointFlowStoreProvider>{props.children}</WaypointFlowStoreProvider>
  </EnergyStoreProvider>
)

const setupClearOnEnergyDepleted = () => {
  const { result } = renderHook(
    () => {
      useClearWaypointFlowOnEnergyDepleted()

      return {
        energy: useEnergyStoreApi(),
        energyDispatch: useEnergyEventDispatcher(),
        waypointFlow: useWaypointFlowStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  return result.current
}

describe('useClearWaypointFlowOnEnergyDepleted', () => {
  it('player の EN 切れで目標設定をキャンセルする', async () => {
    const { energy, energyDispatch, waypointFlow } =
      setupClearOnEnergyDepleted()
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    act(() => {
      waypointFlow.getState().propose({ q: 2, r: 3 })
    })
    await act(() =>
      energyDispatch['Energy-consume']({
        actorId: PLAYER_ACTOR_ID,
        amount: max,
      }),
    )

    await waitFor(() => {
      expect(waypointFlow.getState().flowState).toBe('idle')
    })
    expect(waypointFlow.getState().objectiveCell).toBeUndefined()
  })

  it('中継点選択中の EN 切れでも中継点ごと目標設定をキャンセルする', async () => {
    const { energy, energyDispatch, waypointFlow } =
      setupClearOnEnergyDepleted()
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    act(() => {
      waypointFlow.getState().propose({ q: 2, r: 3 })
      waypointFlow.getState().setFlowState('selecting')
      waypointFlow.getState().setWaypoints([{ q: 1, r: 1 }])
    })
    await act(() =>
      energyDispatch['Energy-consume']({
        actorId: PLAYER_ACTOR_ID,
        amount: max,
      }),
    )

    await waitFor(() => {
      expect(waypointFlow.getState().flowState).toBe('idle')
    })
    expect(waypointFlow.getState().waypoints).toEqual([])
  })

  it('EN が残る消費では何もしない', async () => {
    const { energyDispatch, waypointFlow } = setupClearOnEnergyDepleted()

    act(() => {
      waypointFlow.getState().propose({ q: 2, r: 3 })
    })
    await act(() =>
      energyDispatch['Energy-consume']({ actorId: PLAYER_ACTOR_ID, amount: 1 }),
    )

    expect(waypointFlow.getState().flowState).toBe('proposing')
  })
})
