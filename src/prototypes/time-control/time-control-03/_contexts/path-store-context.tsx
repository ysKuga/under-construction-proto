import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { PathState, PathStore } from '../_stores/path-store'

export const PathStoreContext = createContext<null | PathStore>(null)

export const usePathStore = <T,>(selector: (state: PathState) => T): T => {
  const store = useContext(PathStoreContext)

  if (store === null) {
    throw new Error(
      'usePathStore should be used within <PathStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
