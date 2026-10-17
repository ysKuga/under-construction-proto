'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createItemStore } from './store'
import { ItemInstance, ItemState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<ItemState>('Item')

/** Item store 用 Context */
export const ItemStoreContext = StoreContext

type ItemStoreProviderProps = PropsWithChildren<{
  /** 初期配置するアイテム一覧 */
  initialItems: ItemInstance[]
}>

/** Item store を生成し Context 経由で配布する */
export const ItemStoreProvider = (props: ItemStoreProviderProps) => {
  const { children, initialItems } = props

  const [itemStore] = useState(() => createItemStore(initialItems))

  return (
    <ItemStoreContext.Provider value={itemStore}>
      {children}
    </ItemStoreContext.Provider>
  )
}

/** Item store を selector 購読する */
export const useItemStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - tick ドライバ等、selector を経由せず `getState()` を直接叩く用途向け
 */
export const useItemStoreApi = (): StoreApi<ItemState> => useStoreApi()
