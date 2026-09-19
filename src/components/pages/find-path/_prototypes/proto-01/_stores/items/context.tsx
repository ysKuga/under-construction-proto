'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { GridPosition } from '@/prototypes/stage/stage-06/_contexts/actor-node-registry'
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
  /** 障害物セル一覧（通行不可、静的） */
  obstacleCells: GridPosition[]
}>

/** Item store を生成し Context 経由で配布する */
export const ItemStoreProvider = (props: ItemStoreProviderProps) => {
  const { children, initialItems, obstacleCells } = props

  const [itemStore] = useState(() =>
    createItemStore(initialItems, obstacleCells),
  )

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
