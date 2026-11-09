import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren, useState } from 'react'

import { ActorsStoreProvider } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'

import {
  useExpeditionEventDispatcher,
  useExpeditionEventListener,
} from '../../_events'
import { ExpeditionEventContext } from '../../_events/_contexts/event-context'
import { ChoicesStoreProvider, useChoicesStore } from '../../_stores/choices'
import { GamePhaseStoreProvider } from '../../_stores/game-phase'
import { ItemStoreProvider } from '../../_stores/items'
import { ItemInstance } from '../../_stores/items/types'
import {
  PlayerActivityStoreProvider,
  usePlayerActivityStoreApi,
} from '../../_stores/player-activity'

import { useEnergySpotChoice } from '.'

vi.unmock('zustand')

/** player の開始セル */
const playerCell = { q: 0, r: 0 }

/** player の開始セルの EN スポット */
const energySpot: ItemInstance = {
  amount: 1,
  cell: playerCell,
  id: 'spot-a',
  kind: 'energy-charge',
  stock: 3,
}

/**
 * EN スポットの使用の選択肢と、状態を変える store api・event を描画する
 *
 * - listener（`ExpeditionEventListeners`）を含めず EventTarget のみ配布する
 *
 * @param onUseEnergySpot `Expedition-use-energy-spot` の listener
 * @param onActionRejected `Expedition-action-rejected` の listener
 */
const renderEnergySpotChoice = (
  onUseEnergySpot: (event: Event) => void = () => {},
  onActionRejected: () => void = () => {},
) => {
  const Wrapper = (props: PropsWithChildren) => {
    const [eventTarget] = useState(() => new EventTarget())

    return (
      <GamePhaseStoreProvider>
        <PlayerActivityStoreProvider>
          <EnergyStoreProvider>
            <ActorsStoreProvider
              initialActors={{ [PLAYER_ACTOR_ID]: playerCell }}
            >
              <ItemStoreProvider initialItems={[energySpot]}>
                <ChoicesStoreProvider>
                  <ExpeditionEventContext.Provider value={eventTarget}>
                    {props.children}
                  </ExpeditionEventContext.Provider>
                </ChoicesStoreProvider>
              </ItemStoreProvider>
            </ActorsStoreProvider>
          </EnergyStoreProvider>
        </PlayerActivityStoreProvider>
      </GamePhaseStoreProvider>
    )
  }

  return renderHook(
    () => {
      useEnergySpotChoice()
      useExpeditionEventListener('Expedition-use-energy-spot', onUseEnergySpot)
      useExpeditionEventListener('Expedition-action-rejected', onActionRejected)

      return {
        activity: usePlayerActivityStoreApi(),
        choiceIds: useChoicesStore((state) => state.choices).map(
          ({ id }) => id,
        ),
        dispatcher: useExpeditionEventDispatcher(),
        energy: useEnergyStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )
}

describe('useEnergySpotChoice', () => {
  it('EN スポット上で停止中、かつ補給できる間のみ登録する', () => {
    const { result } = renderEnergySpotChoice()

    // EN が上限: 補給できない
    expect(result.current.choiceIds).toEqual([])

    act(() => result.current.energy.getState().consume(PLAYER_ACTOR_ID, 1))
    expect(result.current.choiceIds).toEqual(['energy-spot'])

    act(() => result.current.activity.getState().setActivity('moving'))
    expect(result.current.choiceIds).toEqual([])
  })

  it('選択で EN スポットの使用を要求し、拒否されたら通知する', async () => {
    const onUseEnergySpot = vi.fn<(event: Event) => void>((event) =>
      event.preventDefault(),
    )
    const onActionRejected = vi.fn<() => void>()
    const { result } = renderEnergySpotChoice(onUseEnergySpot, onActionRejected)

    act(() => result.current.energy.getState().consume(PLAYER_ACTOR_ID, 1))
    await act(async () => {
      await result.current.dispatcher['Expedition-choice-select']({
        id: 'energy-spot',
      })
    })

    expect(onUseEnergySpot).toHaveBeenCalledTimes(1)
    expect(onActionRejected).toHaveBeenCalledTimes(1)
  })
})
