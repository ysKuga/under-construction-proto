import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { ActorState, ActorStore } from '../_stores/actor-store'

/**
 * store インスタンス (参照は不変) のみを配布する
 *
 * - value に state 自体を含めないため、更新では Context 自体は再生成されず、\
 *   Provider 配下の再レンダリングは発生しない
 */
export const ActorStoreContext = createContext<ActorStore | null>(null)

export const useActorStore = <T,>(selector: (state: ActorState) => T): T => {
  const store = useContext(ActorStoreContext)

  if (store === null) {
    throw new Error(
      'useActorStore should be used within <ActorStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
