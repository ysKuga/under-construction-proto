import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'

import {
  ExpeditionEventProvider,
  useExpeditionEventDispatcher,
  useExpeditionEventListener,
} from '../../_events'
import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../_stores/carried-items'
import { ChoicesStoreProvider, useChoicesStore } from '../../_stores/choices'
import { GamePhaseStoreProvider } from '../../_stores/game-phase'
import { ItemInstance } from '../../_stores/items/types'
import { MoveHistoryStoreProvider } from '../../_stores/move-history'
import {
  PlayerActivityStoreProvider,
  usePlayerActivityStoreApi,
} from '../../_stores/player-activity'

import { useRescueChoice } from '.'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <GamePhaseStoreProvider>
    <EnergyStoreProvider>
      <MoveHistoryStoreProvider>
        <CarriedItemStoreProvider>
          <PlayerActivityStoreProvider>
            <ChoicesStoreProvider>
              <ExpeditionEventProvider>
                {props.children}
              </ExpeditionEventProvider>
            </ChoicesStoreProvider>
          </PlayerActivityStoreProvider>
        </CarriedItemStoreProvider>
      </MoveHistoryStoreProvider>
    </EnergyStoreProvider>
  </GamePhaseStoreProvider>
)

const chargeItem: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-a',
  kind: 'energy-charge',
}

/**
 * 救助の選択肢と、状態を変える store api・event を描画する
 *
 * @param onResetToCheckpoint チェックポイントへのリセットの listener
 * @param onActionRejected `Expedition-action-rejected` の listener
 */
const renderRescueChoice = (
  onResetToCheckpoint: (event: Event) => void = () => {},
  onActionRejected: () => void = () => {},
) =>
  renderHook(
    () => {
      useRescueChoice()
      useExpeditionEventListener(
        'Expedition-reset-to-checkpoint',
        onResetToCheckpoint,
      )
      useExpeditionEventListener('Expedition-action-rejected', onActionRejected)

      return {
        activity: usePlayerActivityStoreApi(),
        carriedItems: useCarriedItemStoreApi(),
        choices: useChoicesStore((state) => state.choices),
        dispatcher: useExpeditionEventDispatcher(),
        energy: useEnergyStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

/**
 * player の EN を使い切る
 *
 * @param result 描画結果
 */
const depleteEnergy = (
  result: ReturnType<typeof renderRescueChoice>['result'],
) => {
  const { energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => energy.getState().consume(PLAYER_ACTOR_ID, max))
}

/**
 * 救助を選ぶ
 *
 * @param result 描画結果
 */
const selectRescue = (
  result: ReturnType<typeof renderRescueChoice>['result'],
) =>
  act(async () => {
    await result.current.dispatcher['Expedition-choice-select']({
      id: 'rescue',
    })
  })

describe('useRescueChoice', () => {
  it('EN 切れ中のみ登録し、補給中は外す', () => {
    const { result } = renderRescueChoice()

    expect(result.current.choices).toEqual([])

    depleteEnergy(result)
    expect(result.current.choices.map(({ id }) => id)).toEqual(['rescue'])

    act(() => result.current.activity.getState().setActivity('charging'))
    expect(result.current.choices).toEqual([])
  })

  it('手持ちがあれば、そのアイテムを救済手段として使う', async () => {
    const onResetToCheckpoint = vi.fn<(event: Event) => void>()
    const { result } = renderRescueChoice(onResetToCheckpoint)

    depleteEnergy(result)
    act(() => result.current.carriedItems.getState().pickUp(chargeItem))
    await selectRescue(result)

    expect(result.current.carriedItems.getState().carriedItems).toEqual([])
    expect(
      result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
    ).toBe(chargeItem.amount)
    expect(onResetToCheckpoint).not.toHaveBeenCalled()
  })

  it('手持ちがなければ、チェックポイントへのリセットを要求する', async () => {
    const onResetToCheckpoint = vi.fn<(event: Event) => void>()
    const onActionRejected = vi.fn<() => void>()
    const { result } = renderRescueChoice(onResetToCheckpoint, onActionRejected)

    depleteEnergy(result)
    expect(result.current.choices[0].label).toBe('チェックポイントへ戻る')

    await selectRescue(result)

    expect(onResetToCheckpoint).toHaveBeenCalledTimes(1)
    expect(onActionRejected).not.toHaveBeenCalled()
  })

  it('救済手段を拒否されたら拒否を通知する', async () => {
    const onActionRejected = vi.fn<() => void>()
    const { result } = renderRescueChoice(
      (event) => event.preventDefault(),
      onActionRejected,
    )

    depleteEnergy(result)
    await selectRescue(result)

    expect(onActionRejected).toHaveBeenCalledTimes(1)
  })
})
