import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import {
  PlannedPathState,
  PlannedPathStore,
} from '../_stores/planned-path-store'

export const PlannedPathStoreContext = createContext<null | PlannedPathStore>(
  null,
)

export const usePlannedPathStore = <T,>(
  selector: (state: PlannedPathState) => T,
): T => {
  const store = useContext(PlannedPathStoreContext)

  if (store === null) {
    throw new Error(
      'usePlannedPathStore should be used within <PlannedPathStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
