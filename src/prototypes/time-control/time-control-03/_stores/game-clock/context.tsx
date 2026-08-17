import { createStoreContext } from '@/stores/utils/create-store-context'

import { GameClockState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<GameClockState>('GameClock')

/** GameClock store 用 Context */
export const GameClockStoreContext = StoreContext

/** GameClock store を selector 購読する */
export const useGameClockStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)
