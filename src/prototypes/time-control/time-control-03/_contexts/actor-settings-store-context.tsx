import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import {
  ActorSettingsState,
  ActorSettingsStore,
} from '../_stores/actor-settings-store'

export const ActorSettingsStoreContext =
  createContext<ActorSettingsStore | null>(null)

export const useActorSettingsStore = <T,>(
  selector: (state: ActorSettingsState) => T,
): T => {
  const store = useContext(ActorSettingsStoreContext)

  if (store === null) {
    throw new Error(
      'useActorSettingsStore should be used within <ActorSettingsStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
