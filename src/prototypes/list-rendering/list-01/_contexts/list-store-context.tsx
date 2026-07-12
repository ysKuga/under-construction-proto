import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { ListState, ListStore } from '../_stores/list-store'

/**
 * store インスタンス (参照は不変) のみを配布する
 * - value に state 自体を含めないため、renameItem による state 変更では
 *   Context 自体は再生成されず、Provider 配下の再レンダリングは発生しない
 */
export const ListStoreContext = createContext<ListStore | null>(null)

export const useListStore = <T,>(selector: (state: ListState) => T): T => {
  const store = useContext(ListStoreContext)

  if (store === null) {
    throw new Error(
      'useListStore should be used within <ListStoreContext.Provider>',
    )
  }

  return useStore(store, selector)
}
