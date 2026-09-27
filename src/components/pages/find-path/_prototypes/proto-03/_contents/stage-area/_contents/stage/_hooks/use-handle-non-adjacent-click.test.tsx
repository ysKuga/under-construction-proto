import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import { FindPathEventProvider } from '../../../../../_events'
import { CarriedItemStoreProvider } from '../../../../../_stores/carried-items'
import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../_stores/waypoint-flow'

import { useHandleNonAdjacentClick } from './use-handle-non-adjacent-click'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider capacity={3}>
      <FindPathEventProvider>
        <ActorsStoreProvider
          initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}
        >
          <WaypointFlowStoreProvider>
            {props.children}
          </WaypointFlowStoreProvider>
        </ActorsStoreProvider>
      </FindPathEventProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

const renderHandler = () =>
  renderHook(
    () => ({
      energy: useEnergyStoreApi(),
      handleNonAdjacentClick: useHandleNonAdjacentClick(),
      waypointFlow: useWaypointFlowStoreApi(),
    }),
    { wrapper: Wrapper },
  )

test('経路提示中に目標セルを再クリックすると目標設定をキャンセルする', async () => {
  const { result } = renderHandler()
  const { handleNonAdjacentClick, waypointFlow } = result.current

  act(() => {
    waypointFlow.getState().propose({ q: 2, r: 3 })
  })
  await act(() => handleNonAdjacentClick({ q: 2, r: 3 }))

  expect(waypointFlow.getState().flowState).toBe('idle')
  expect(waypointFlow.getState().objectiveCell).toBeUndefined()
})

test('EN 切れでも目標セルの再クリックでキャンセルできる', async () => {
  const { result } = renderHandler()
  const { energy, handleNonAdjacentClick, waypointFlow } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => {
    waypointFlow.getState().propose({ q: 2, r: 3 })
    energy.getState().consume(PLAYER_ACTOR_ID, max)
  })
  await act(() => handleNonAdjacentClick({ q: 2, r: 3 }))

  expect(waypointFlow.getState().flowState).toBe('idle')
})
