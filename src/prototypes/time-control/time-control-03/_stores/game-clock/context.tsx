import { createStoreContext } from '@/stores/utils/create-store-context'

import { GameClockState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<GameClockState>('GameClock')

export const GameClockStoreContext = StoreContext
export const useGameClockStore = useStoreSelector
