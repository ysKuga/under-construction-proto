'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createBubbleSlotsStore } from './store'
import { BubbleSlotsStoreState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<BubbleSlotsStoreState>('BubbleSlots')

/** BubbleSlots store 用 Context */
export const BubbleSlotsStoreContext = StoreContext

/** BubbleSlots store を生成し Context 経由で配布する */
export const BubbleSlotsStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [bubbleSlotsStore] = useState(createBubbleSlotsStore)

  return (
    <BubbleSlotsStoreContext.Provider value={bubbleSlotsStore}>
      {children}
    </BubbleSlotsStoreContext.Provider>
  )
}

/** BubbleSlots store を selector 購読する */
export const useBubbleSlotsStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - 表示制御の操作等、購読せず操作する用途向け
 */
export const useBubbleSlotsStoreApi = (): StoreApi<BubbleSlotsStoreState> =>
  useStoreApi()
