import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import {
  ExpeditionEventProvider,
  useExpeditionEventListener,
} from '../../../../../_events'
import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../../../../_stores/carried-items'
import { ItemInstance } from '../../../../../_stores/items/types'
import { MoveHistoryStoreProvider } from '../../../../../_stores/move-history'
import { PlayerActivityStoreProvider } from '../../../../../_stores/player-activity'

import { useRescue } from './use-rescue'

vi.unmock('zustand')

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

const chargeItem: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-a',
  kind: 'energy-charge',
}

/**
 * `useRescue` を描画する
 *
 * @param onResetToCheckpoint チェックポイントへのリセットの listener
 * @param onShakeBotBubble 吹き出しを揺らす要求の listener
 */
const renderRescue = (
  onResetToCheckpoint: (event: Event) => void,
  onShakeBotBubble: () => void,
) =>
  renderHook(
    () => {
      useExpeditionEventListener(
        'Expedition-reset-to-checkpoint',
        onResetToCheckpoint,
      )
      useExpeditionEventListener(
        'Expedition-shake-bot-bubble',
        onShakeBotBubble,
      )

      return {
        carriedItems: useCarriedItemStoreApi(),
        energy: useEnergyStoreApi(),
        rescue: useRescue(),
      }
    },
    { wrapper: Wrapper },
  )

test('手持ちがあれば、そのアイテムを救済手段として使う', async () => {
  const onResetToCheckpoint = vi.fn<(event: Event) => void>()
  const { result } = renderRescue(onResetToCheckpoint, vi.fn<() => void>())
  const { carriedItems, energy } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => {
    energy.getState().consume(PLAYER_ACTOR_ID, max)
    carriedItems.getState().pickUp(chargeItem)
  })

  expect(result.current.rescue.rescueItemKind).toBe('energy-charge')

  await act(() => result.current.rescue.handleRescueClick())

  expect(carriedItems.getState().carriedItems).toEqual([])
  expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(
    chargeItem.amount,
  )
  expect(onResetToCheckpoint).not.toHaveBeenCalled()
})

test('手持ちがなければ、チェックポイントへのリセットを要求する', async () => {
  const onResetToCheckpoint = vi.fn<(event: Event) => void>()
  const onShakeBotBubble = vi.fn<() => void>()
  const { result } = renderRescue(onResetToCheckpoint, onShakeBotBubble)

  expect(result.current.rescue.rescueItemKind).toBeUndefined()

  await act(() => result.current.rescue.handleRescueClick())

  expect(onResetToCheckpoint).toHaveBeenCalledTimes(1)
  expect(onShakeBotBubble).not.toHaveBeenCalled()
})

test('救済手段を拒否されたら吹き出しを揺らす', async () => {
  const onShakeBotBubble = vi.fn<() => void>()
  const { result } = renderRescue(
    (event) => event.preventDefault(),
    onShakeBotBubble,
  )

  await act(() => result.current.rescue.handleRescueClick())

  expect(onShakeBotBubble).toHaveBeenCalledTimes(1)
})
