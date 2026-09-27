import { renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { ItemUsage } from '../../../_lib/item-usage'
import {
  CarriedItemStoreProvider,
  useCarriedItemStoreApi,
} from '../../../_stores/carried-items'
import { ItemInstance } from '../../../_stores/items/types'
import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import { FindPathEventProvider } from '../../index.contexts'

const RECOVERY_ITEM: ItemInstance = {
  amount: 3,
  cell: { q: 1, r: 1 },
  id: 'item-1',
  kind: 'energy-recovery',
}

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider>
      <FindPathEventProvider>{props.children}</FindPathEventProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

/** EN を使い切り、回復アイテムを1つ携行した状態で描画する */
const renderListener = () => {
  const rendered = renderHook(
    () => ({
      carriedItems: useCarriedItemStoreApi(),
      dispatcher: useFindPathEventDispatcher(),
      energy: useEnergyStoreApi(),
    }),
    { wrapper: Wrapper },
  )
  const { carriedItems, energy } = rendered.result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)
  energy.getState().consume(PLAYER_ACTOR_ID, max)
  carriedItems.getState().pickUp(RECOVERY_ITEM)

  return rendered
}

test('recover-energy で使用すると EN が回復し、携行から取り除かれる', async () => {
  const { result } = renderListener()
  const { carriedItems, dispatcher, energy } = result.current

  await expect(
    dispatcher['FindPath-use-item']({
      itemId: RECOVERY_ITEM.id,
      usage: 'recover-energy',
    }),
  ).resolves.toBe(true)
  expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(3)
  expect(carriedItems.getState().carriedItems).toEqual([])
})

test('携行していないアイテムは使用を拒否する', async () => {
  const { result } = renderListener()
  const { carriedItems, dispatcher } = result.current

  await expect(
    dispatcher['FindPath-use-item']({
      itemId: 'unknown',
      usage: 'recover-energy',
    }),
  ).resolves.toBe(false)
  expect(carriedItems.getState().carriedItems).toEqual([RECOVERY_ITEM])
})

test('許可されていない使用方法は拒否し、アイテムを残す', async () => {
  const { result } = renderListener()
  const { carriedItems, dispatcher, energy } = result.current

  await expect(
    dispatcher['FindPath-use-item']({
      itemId: RECOVERY_ITEM.id,
      // ホワイトリスト外の使用方法（型上は存在しないため cast する）
      usage: 'throw' as ItemUsage,
    }),
  ).resolves.toBe(false)
  expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(0)
  expect(carriedItems.getState().carriedItems).toEqual([RECOVERY_ITEM])
})
