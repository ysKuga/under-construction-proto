'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createCarriedItemStore } from './store'
import { CarriedItemState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<CarriedItemState>('CarriedItem')

/** CarriedItem store 用 Context */
export const CarriedItemStoreContext = StoreContext

type CarriedItemStoreProviderProps = PropsWithChildren<{
  /** 携行可能な上限数 */
  capacity: number
}>

/** CarriedItem store を生成し Context 経由で配布する */
export const CarriedItemStoreProvider = (
  props: CarriedItemStoreProviderProps,
) => {
  const { capacity, children } = props

  const [carriedItemStore] = useState(() => createCarriedItemStore(capacity))

  return (
    <CarriedItemStoreContext.Provider value={carriedItemStore}>
      {children}
    </CarriedItemStoreContext.Provider>
  )
}

/** CarriedItem store を selector 購読する */
export const useCarriedItemStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - `useFindPathTick` 等、selector を経由せず `getState()` を直接叩く用途向け
 */
export const useCarriedItemStoreApi = (): StoreApi<CarriedItemState> =>
  useStoreApi()
