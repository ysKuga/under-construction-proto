import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { PositionState, PositionStore } from '../_stores/position-store'

export const PositionStoreContext = createContext<null | PositionStore>(null)

const usePositionStoreContext = (): PositionStore => {
  const store = useContext(PositionStoreContext)

  if (store === null) {
    throw new Error(
      'usePositionStore should be used within <PositionStoreContext.Provider>',
    )
  }

  return store
}

export const usePositionStore = <T,>(
  selector: (state: PositionState) => T,
): T => useStore(usePositionStoreContext(), selector)

/**
 * 生の store を返す
 *
 * - React の再レンダリングを経由せず ref 経由で DOM を直接更新する購読\
 *   (`store.subscribe` + `store.getState()`) 向け
 */
export const usePositionStoreApi = (): PositionStore =>
  usePositionStoreContext()
