import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { IntentState, IntentStore } from '../_stores/intent-store'

export const IntentStoreContext = createContext<IntentStore | null>(null)

export const useIntentStore = <T,>(selector: (state: IntentState) => T): T => {
  const store = useContext(IntentStoreContext)

  if (store === null) {
    throw new Error(
      'useIntentStore should be used within <IntentStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
