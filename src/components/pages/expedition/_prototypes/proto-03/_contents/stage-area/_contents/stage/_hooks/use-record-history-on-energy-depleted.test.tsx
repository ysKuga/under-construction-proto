import { act, renderHook, waitFor } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyEventDispatcher,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import {
  MoveHistoryStoreProvider,
  useMoveHistoryStoreApi,
} from '../../../../../_stores/move-history'

import { useRecordHistoryOnEnergyDepleted } from './use-record-history-on-energy-depleted'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <MoveHistoryStoreProvider>{props.children}</MoveHistoryStoreProvider>
  </EnergyStoreProvider>
)

const setupRecordOnEnergyDepleted = () => {
  const { result } = renderHook(
    () => {
      useRecordHistoryOnEnergyDepleted()

      return {
        energy: useEnergyStoreApi(),
        energyDispatch: useEnergyEventDispatcher(),
        moveHistory: useMoveHistoryStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  return result.current
}

describe('useRecordHistoryOnEnergyDepleted', () => {
  it('player の EN 切れを記録する', async () => {
    const { energy, energyDispatch, moveHistory } =
      setupRecordOnEnergyDepleted()
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    await act(() =>
      energyDispatch['Energy-consume']({
        actorId: PLAYER_ACTOR_ID,
        amount: max,
      }),
    )

    await waitFor(() => {
      expect(moveHistory.getState().entries).toEqual([
        { kind: 'energy-depleted' },
      ])
    })
  })

  it('EN が残る消費では記録しない', async () => {
    const { energyDispatch, moveHistory } = setupRecordOnEnergyDepleted()

    await act(() =>
      energyDispatch['Energy-consume']({ actorId: PLAYER_ACTOR_ID, amount: 1 }),
    )

    expect(moveHistory.getState().entries).toEqual([])
  })
})
