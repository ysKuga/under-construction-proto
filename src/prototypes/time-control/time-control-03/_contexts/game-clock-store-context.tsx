import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { GameClockState, GameClockStore } from '../_stores/game-clock-store'

export const GameClockStoreContext = createContext<GameClockStore | null>(null)

export const useGameClockStore = <T,>(
  selector: (state: GameClockState) => T,
): T => {
  const store = useContext(GameClockStoreContext)

  if (store === null) {
    throw new Error(
      'useGameClockStore should be used within <GameClockStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
