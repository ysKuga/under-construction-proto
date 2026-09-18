'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createTickStatusStore } from './store'
import { TickStatusState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<TickStatusState>('TickStatus')

/** TickStatus store 用 Context */
export const TickStatusStoreContext = StoreContext

/** TickStatus store を生成し Context 経由で配布する */
export const TickStatusStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [tickStatusStore] = useState(() => createTickStatusStore())

  return (
    <TickStatusStoreContext.Provider value={tickStatusStore}>
      {children}
    </TickStatusStoreContext.Provider>
  )
}

/** TickStatus store を selector 購読する */
export const useTickStatusStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - `useFindPathTick` 等、selector を経由せず `getState()` を直接叩く用途向け
 */
export const useTickStatusStoreApi = (): StoreApi<TickStatusState> =>
  useStoreApi()
