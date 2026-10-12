import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'

import { ItemUsage } from '../../../_lib/item-usage'
import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../../_stores/carried-items'
import { ItemInstance } from '../../../_stores/items/types'
import {
  MoveHistoryStoreProvider,
  useMoveHistoryStoreApi,
} from '../../../_stores/move-history'
import { PlayerActivityStoreProvider } from '../../../_stores/player-activity'
import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import {
  FindPathEventProvider,
  useFindPathEventTarget,
} from '../../index.contexts'

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
          <FindPathEventProvider>{props.children}</FindPathEventProvider>
        </PlayerActivityStoreProvider>
      </CarriedItemStoreProvider>
    </MoveHistoryStoreProvider>
  </EnergyStoreProvider>
)

/**
 * EN 補給アイテムを1つ携行した状態で描画する
 *
 * - `onItemUsed`: `FindPath-item-used` の detail を受け取る spy
 */
const renderListener = () => {
  const rendered = renderHook(
    () => ({
      carriedItems: useCarriedItemStoreApi(),
      dispatcher: useFindPathEventDispatcher(),
      eventTarget: useFindPathEventTarget(),
      moveHistory: useMoveHistoryStoreApi(),
    }),
    { wrapper: Wrapper },
  )
  const { carriedItems, eventTarget } = rendered.result.current
  carriedItems.getState().pickUp(CHARGE_ITEM)
  const onItemUsed = vi.fn<(detail: unknown) => void>()
  eventTarget.addEventListener('FindPath-item-used', (event) =>
    onItemUsed((event as CustomEvent).detail),
  )

  return { ...rendered, onItemUsed }
}

test('受理すると携行から取り除き、使用を通知・記録する', async () => {
  const { onItemUsed, result } = renderListener()
  const { carriedItems, dispatcher, moveHistory } = result.current

  await expect(
    dispatcher['FindPath-use-item']({
      itemId: CHARGE_ITEM.id,
      usage: 'charge-energy',
    }),
  ).resolves.toBe(true)
  expect(carriedItems.getState().carriedItems).toEqual([])
  expect(onItemUsed).toHaveBeenCalledWith({
    item: CHARGE_ITEM,
    usage: 'charge-energy',
  })
  expect(moveHistory.getState().entries).toEqual([
    { itemKind: 'energy-charge', kind: 'use-item' },
  ])
})

test('携行していないアイテムは使用を拒否し、記録しない', async () => {
  const { onItemUsed, result } = renderListener()
  const { carriedItems, dispatcher, moveHistory } = result.current

  await expect(
    dispatcher['FindPath-use-item']({
      itemId: 'unknown',
      usage: 'charge-energy',
    }),
  ).resolves.toBe(false)
  expect(carriedItems.getState().carriedItems).toEqual([CHARGE_ITEM])
  expect(onItemUsed).not.toHaveBeenCalled()
  expect(moveHistory.getState().entries).toEqual([])
})

test('許可されていない使用方法は拒否し、アイテムを残す', async () => {
  const { onItemUsed, result } = renderListener()
  const { carriedItems, dispatcher } = result.current

  await expect(
    dispatcher['FindPath-use-item']({
      itemId: CHARGE_ITEM.id,
      // ホワイトリスト外の使用方法（型上は存在しないため cast する）
      usage: 'throw' as ItemUsage,
    }),
  ).resolves.toBe(false)
  expect(carriedItems.getState().carriedItems).toEqual([CHARGE_ITEM])
  expect(onItemUsed).not.toHaveBeenCalled()
})
