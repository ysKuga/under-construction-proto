import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { PositionState, PositionStore } from '../_stores/position-store'

export const PositionStoreContext = createContext<null | PositionStore>(null)

export const usePositionStore = <T,>(
  selector: (state: PositionState) => T,
): T => {
  const store = useContext(PositionStoreContext)

  if (store === null) {
    throw new Error(
      'usePositionStore should be used within <PositionStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
